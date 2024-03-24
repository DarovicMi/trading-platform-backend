export class PermissionAlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionAlreadyExistsError";
    Object.setPrototypeOf(this, PermissionAlreadyExistsError.prototype);
  }
}
