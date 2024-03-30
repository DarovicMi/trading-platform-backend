import { EmailService } from "../services/EmailService";
import { Request, Response } from "express";
import { ServerErrorMessage } from "../constants/server/ServerErrorMessage";
import { UserNotFoundError } from "../errors/user/UserNotFoundError";
import { UserErrorMessage } from "../constants/user/UserErrorMessage";
import { ActivationTokenNotFoundError } from "../errors/email-activation/ActivationTokenNotFoundError";
import { EmailActivationMessage } from "../constants/email-activation/EmailActivationMessage";
import { ActivationTokenNotExpiredError } from "../errors/email-activation/ActivationTokenNotExpiredError";
import { UserIsAlreadyActiveError } from "../errors/email-activation/UserIsAlreadyActiveError";

export class EmailController {
  constructor(private emailService: EmailService) {
    this.emailService = emailService;
  }

  async activateUser(req: Request, res: Response): Promise<Response> {
    try {
      const { token } = req.query;
      if (!token) {
        return res
          .status(400)
          .send({ message: EmailActivationMessage.ACTIVATION_TOKEN_REQUIRED });
      }

      await this.emailService.activateUser(token.toString());
      return res
        .status(200)
        .send({ message: EmailActivationMessage.ACCOUNT_ACTIVATED });
    } catch (error) {
      if (error instanceof ActivationTokenNotFoundError) {
        return res.status(404).send({ message: error.message });
      }
      return res.status(500).send({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }

  async reissueActivationToken(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;
      if (!email) {
        return res
          .status(400)
          .send({ message: UserErrorMessage.USER_EMAIL_VALIDATION });
      }

      await this.emailService.reissueActivationToken(email);

      return res
        .status(200)
        .send({ message: EmailActivationMessage.NEW_ACTIVATION_TOKEN_ISSUED });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return res.status(404).send({ message: error.message });
      } else if (error instanceof ActivationTokenNotExpiredError) {
        return res.status(400).send({ message: error.message });
      } else if (error instanceof UserIsAlreadyActiveError) {
        return res.status(400).send({ message: error.message });
      }
      return res.status(500).send({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }
}
