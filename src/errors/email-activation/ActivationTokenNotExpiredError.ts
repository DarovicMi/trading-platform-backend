export class ActivationTokenNotExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActivationTokenNotExpiredError";
    Object.setPrototypeOf(this, ActivationTokenNotExpiredError.prototype);
  }
}
