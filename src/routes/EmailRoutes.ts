import { Request, Response, Router } from "express";
import { EmailService } from "../services/EmailService";
import { EmailController } from "../controllers/EmailController";

const router = Router();

const emailService = new EmailService();
const emailController = new EmailController(emailService);

router.get("/activate", [], (req: Request, res: Response) =>
  emailController.activateUser(req, res)
);

router.post("/reissue-activation-token", [], (req: Request, res: Response) =>
  emailController.reissueActivationToken(req, res)
);

export default router;
