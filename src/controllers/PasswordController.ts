import { Request, Response } from "express";
import { PasswordService } from "../services/PasswordService";
import { ServerErrorMessage } from "../constants/server/ServerErrorMessage";
import { PasswordMessage } from "../constants/password/PasswordMessage";
import { InvalidOrExpiredPasswordResetTokenError } from "../errors/password/InvalidOrExpiredPasswordResetTokenError";
import { UserErrorMessage } from "../constants/user/UserErrorMessage";

export class PasswordController {
  constructor(private passwordService: PasswordService) {
    this.passwordService = passwordService;
  }

  async initiateReset(req: Request, res: Response) {
    try {
      await this.passwordService.initiatePasswordReset(req.body.email);
      return res
        .status(200)
        .json({ message: PasswordMessage.PASSWORD_RESET_EMAIL_SENT });
    } catch (error) {
      return res.status(500).json({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { newPassword, token } = req.body;
      await this.passwordService.resetPassword(token, newPassword);
      return res
        .status(200)
        .json({ message: PasswordMessage.PASSWORD_SUCCESSFULLY_RESET });
    } catch (error) {
      if (error instanceof InvalidOrExpiredPasswordResetTokenError) {
        return res.status(404).send({ message: error.message });
      }
      return res.status(500).json({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { currentPassword, newPassword } = req.body;

      if (userId === undefined) {
        return res
          .status(400)
          .json({ message: UserErrorMessage.USER_NOT_FOUND });
      }

      await this.passwordService.changePassword(
        userId,
        currentPassword,
        newPassword
      );

      return res
        .status(200)
        .json({ message: PasswordMessage.PASSWORD_SUCCESSFULLY_CHANGED });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }
}
