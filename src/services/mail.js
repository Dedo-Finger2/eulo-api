import { AbstractClassInstantiatedError } from "../errors/abstract-class-instantiated.js";
import { MethodNotImplementedError } from "../errors/method-not-implemented.js";

export class MailService {
  constructor() {
    if (this.constructor.name === MailService) {
      throw new AbstractClassInstantiatedError();
    }
  }

  // eslint-disable-next-line no-unused-vars
  async sendMail(message) {
    throw new MethodNotImplementedError();
  }
}
