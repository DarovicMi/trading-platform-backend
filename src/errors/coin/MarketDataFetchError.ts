export class MarketDataFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MarketDataFetchError";
    Object.setPrototypeOf(this, MarketDataFetchError.prototype);
  }
}
