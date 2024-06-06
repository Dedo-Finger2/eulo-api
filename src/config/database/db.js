import {
  AbstractClassInstantiatedError,
  MethodNotImplementedError,
} from "../../errors";

export class Db {
  static _connection;

  constructor() {
    if (new.target === Db) throw new AbstractClassInstantiatedError();
  }

  static async getConnection() {
    throw new MethodNotImplementedError();
  }
}
