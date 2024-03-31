import { validate } from "class-validator";
import { User } from "../entities/User";
import { UserValidationError } from "../errors/user/UserValidationError";
import { ValidationMessage } from "./ValidationMessage";

export class ValidateUser {
  static async validateUserInput(user: Partial<User>): Promise<void> {
    const userInstance = new User();
    Object.assign(userInstance, user);

    const validationErrors = await validate(userInstance);
    if (validationErrors.length > 0) {
      const errorMessages =
        ValidationMessage.extractValidationMessage(validationErrors);
      throw new UserValidationError(errorMessages.join("; "));
    }
  }
}
