import { InvalidEmailError } from "../../errors/invalid-email.js";
import {
  InvalidUserNameLengthError,
  MissingParameterError,
} from "../../errors";

export class User {
  publicId;
  name;
  email;
  createdAt;
  updatedAt;

  constructor({ publicId, userDto }) {
    if (!userDto) throw new MissingParameterError({ parameters: ["userDto"] });

    if (!publicId) {
      this.publicId = crypto.randomUUID();
    }

    Object.assign(this, userDto);
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static build(userDto) {
    if (!userDto) throw new MissingParameterError({ parameters: ["userDto"] });

    User.validateName(userDto.name);
    User.validateEmail(userDto.email);

    return new User({ userDto });
  }

  static validateEmail(email) {
    if (!email) throw new MissingParameterError({ parameters: ["email"] });

    const isEmailValid =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

    if (!isEmailValid) throw new InvalidEmailError();
  }

  static validateName(name) {
    if (!name) throw new MissingParameterError({ parameters: ["name"] });

    const isNameInvalid = name.length < 3;

    if (isNameInvalid) throw new InvalidUserNameLengthError();
  }
}
