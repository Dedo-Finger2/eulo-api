export class InvalidUserNameLengthError extends Error {
  constructor(message = "User name must be at least 3 characters long.") {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
  }
}
