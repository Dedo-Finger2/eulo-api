import {
  AbstractClassInstantiatedError,
  MethodNotImplementedError,
} from "../errors";

export class UserRepository {
  constructor() {
    if (this.constructor.name === UserRepository)
      throw new AbstractClassInstantiatedError();
  }

  async save() {
    throw new MethodNotImplementedError();
  }

  async findByEmail() {
    throw new MethodNotImplementedError();
  }

  async findByPublicId() {
    throw new MethodNotImplementedError();
  }
}
