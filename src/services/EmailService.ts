import * as nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import { AppDataSource } from "../config/DatabaseConfig";
import { User } from "../entities/User";
import { UserNotFoundError } from "../errors/user/UserNotFoundError";
import { UserErrorMessage } from "../constants/user/UserErrorMessage";
import { ActivationTokenNotFoundError } from "../errors/email-activation/ActivationTokenNotFoundError";
import { EmailActivationMessage } from "../constants/email-activation/EmailActivationMessage";
import { ActivationTokenNotExpiredError } from "../errors/email-activation/ActivationTokenNotExpiredError";
import { UserIsAlreadyActiveError } from "../errors/email-activation/UserIsAlreadyActiveError";

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER as string;
const EMAIL_USER = process.env.EMAIL_USER as string;
const EMAIL_PASS = process.env.EMAIL_PASS as string;
const EMAIL_SUBJECT = process.env.EMAIL_SUBJECT as string;
export const EMAIL_ACTIVATION_LINK = process.env
  .EMAIL_ACTIVATION_LINK as string;

export class EmailService {
  private userRepository = AppDataSource.getRepository(User);

  static async sendVerificationEmail(email: string, activationLink: string) {
    const transporter = nodemailer.createTransport({
      service: EMAIL_PROVIDER,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: EMAIL_SUBJECT,
      html: `<p>Please click the link below to verify your email and activate your account:</p><p><a href="${activationLink}">${activationLink}</a></p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending verification email:", error);
      } else {
        console.log("Verification email sent:", info.response);
      }
    });
  }

  async activateUser(token: string): Promise<User> {
    const user = await this.userRepository.findOneBy({
      activationToken: token,
    });
    if (!user) {
      throw new ActivationTokenNotFoundError(
        EmailActivationMessage.ACTIVATION_TOKEN_NOT_FOUND
      );
    }

    if (user.isActive) {
      throw new UserIsAlreadyActiveError(
        EmailActivationMessage.ACCOUNT_ALREADY_ACTIVE
      );
    }

    user.isActive = true;
    user.activationToken = null;

    await this.userRepository.save(user);
    return user;
  }

  async reissueActivationToken(email: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ email });

    if (!user) {
      throw new UserNotFoundError(UserErrorMessage.USER_NOT_FOUND);
    }

    if (user.isActive) {
      throw new UserIsAlreadyActiveError(
        EmailActivationMessage.ACCOUNT_ALREADY_ACTIVE
      );
    }

    if (
      user.activationTokenExpires &&
      user.activationTokenExpires > new Date()
    ) {
      throw new ActivationTokenNotExpiredError(
        EmailActivationMessage.ACTIVATION_TOKEN_NOT_EXPIRED
      );
    }

    const newToken = uuidv4();
    const newExpiry = new Date();
    newExpiry.setHours(newExpiry.getHours() + 1);

    user.activationToken = newToken;
    user.activationTokenExpires = newExpiry;

    await this.userRepository.save(user);

    const activationLink = `${EMAIL_ACTIVATION_LINK}${newToken}`;
    await EmailService.sendVerificationEmail(user.email, activationLink);
  }
}
