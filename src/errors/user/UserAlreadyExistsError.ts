export class UserAlreadyExistsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
        Object.setPrototypeOf(this, UserAlreadyExistsError.prototype);
    }
}