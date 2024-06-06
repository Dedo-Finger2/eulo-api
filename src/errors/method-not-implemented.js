export class MethodNotImplementedError extends Error {
  constructor(message = "Method not implemented.") {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
  }
}
