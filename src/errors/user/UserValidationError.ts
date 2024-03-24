export class UserValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserValidationError";
    Object.setPrototypeOf(this, UserValidationError.prototype);
  }
}
