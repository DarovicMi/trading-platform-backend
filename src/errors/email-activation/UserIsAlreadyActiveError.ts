export class UserIsAlreadyActiveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserIsAlreadyActiveError";
    Object.setPrototypeOf(this, UserIsAlreadyActiveError.prototype);
  }
}
