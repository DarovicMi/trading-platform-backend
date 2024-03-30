export class CoinNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CoinNotFoundError";
    Object.setPrototypeOf(this, CoinNotFoundError.prototype);
  }
}
