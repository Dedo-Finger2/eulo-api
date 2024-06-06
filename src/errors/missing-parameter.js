export class MissingParameterError extends Error {
  constructor({ message = "Missing parameters: ", parameters = [] }) {
    message = message + parameters.join();

    super(message);

    this.message = message;
    this.name = this.constructor.name;
  }
}
