export class InvalidOrExpiredPasswordResetTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidOrExpiredPasswordResetTokenError";
    Object.setPrototypeOf(
      this,
      InvalidOrExpiredPasswordResetTokenError.prototype
    );
  }
}
