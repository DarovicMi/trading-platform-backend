export class CoinFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CoinFetchError";
    Object.setPrototypeOf(this, CoinFetchError.prototype);
  }
}
