export class UserNotFoundError extends Error {
  constructor(message: string, value?: string | number) {
    super(`${message}: ${value}`);
    this.name = "NotFoundException";
    Object.setPrototypeOf(this, UserNotFoundError.prototype);
  }
}
