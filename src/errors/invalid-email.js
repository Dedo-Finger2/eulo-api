export class InvalidEmailError extends Error {
  constructor(message = "Invalid email.") {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
  }
}
