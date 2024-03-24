export class RoleAlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserValidationError";
    Object.setPrototypeOf(this, RoleAlreadyExistsError.prototype);
  }
}
