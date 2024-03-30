export class ActivationTokenNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActivationTokenNotFoundError";
    Object.setPrototypeOf(this, ActivationTokenNotFoundError.prototype);
  }
}
