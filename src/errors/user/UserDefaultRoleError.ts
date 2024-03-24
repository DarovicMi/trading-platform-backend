export class UserDefaultRoleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserValidationError";
    Object.setPrototypeOf(this, UserDefaultRoleError.prototype);
  }
}
