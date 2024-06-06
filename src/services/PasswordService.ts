// src/services/PasswordService.ts

import { AppDataSource } from "../config/DatabaseConfig";
import { User } from "../entities/User";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { EmailService } from "./EmailService";
import { MoreThan } from "typeorm";
import { UserNotFoundError } from "../errors/user/UserNotFoundError";
import { UserErrorMessage } from "../constants/user/UserErrorMessage";
import { InvalidOrExpiredPasswordResetTokenError } from "../errors/password/InvalidOrExpiredPasswordResetTokenError";
import { PasswordMessage } from "../constants/password/PasswordMessage";
import { IncorrectPasswordError } from "../errors/password/IncorrectPasswordError";

const CLIENT_URL = process.env.CLIENT_URL as string;

export class PasswordService {
  private userRepository = AppDataSource.getRepository(User);

  async initiatePasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ email });

    if (!user) {
      throw new UserNotFoundError(UserErrorMessage.USER_NOT_FOUND);
    }

    const resetToken = uuidv4();
    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpires = new Date(Date.now() + 3600000);

    await this.userRepository.save(user);

    const resetLink = `${CLIENT_URL}/password-reset?token=${resetToken}`;
    await EmailService.sendResetPasswordEmail(user.email, resetLink);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetTokenExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new InvalidOrExpiredPasswordResetTokenError(
        PasswordMessage.INVALID_OR_EXPIRED_PASSWORD_TOKEN
      );
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordResetToken = null;
    user.passwordResetTokenExpires = null;

    await this.userRepository.save(user);
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UserNotFoundError(UserErrorMessage.USER_NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      throw new IncorrectPasswordError(PasswordMessage.INCORRECT_PASSWORD);
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await this.userRepository.save(user);
  }
}
