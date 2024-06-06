export class AbstractClassInstantiatedError extends Error {
  constructor(message = "Cannot create an instance of an abstract class.") {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
  }
}
