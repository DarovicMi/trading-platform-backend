export class RoleNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserValidationError";
    Object.setPrototypeOf(this, RoleNotFoundError.prototype);
  }
}
