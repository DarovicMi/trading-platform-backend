import { ValidationError } from "class-validator";

export class ValidationMessage {
  static extractValidationMessage(errors: ValidationError[]): string[] {
    const messages: string[] = [];

    errors.forEach((error) => {
      if (error.constraints) {
        Object.values(error.constraints).forEach((message) => {
          messages.push(message);
        });
      }
    });
    return messages;
  }
}
