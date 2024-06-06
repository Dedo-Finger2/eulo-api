import { MissingParameterError } from "../../errors";

export class InputUserDto {
  name;
  email;

  constructor({ name, email }) {
    if (!name) throw new MissingParameterError({ parameters: ["name"] });
    if (!email) throw new MissingParameterError({ parameters: ["email"] });

    this.name = name;
    this.email = email;
  }
}

export class OutputUserDto {
  id;
  publicId;
  name;
  email;
  createdAt;
  updatedAt;

  constructor({ id, publicId, name, email, createdAt, updatedAt }) {
    const missingParams = [];

    if (!id) missingParams.push("id");
    if (!publicId) missingParams.push("publicId");
    if (!name) missingParams.push("name");
    if (!email) missingParams.push("email");
    if (!createdAt) missingParams.push("createdAt");
    if (!updatedAt) missingParams.push("updatedAt");

    if (missingParams.length) {
      throw new MissingParameterError({ parameters: missingParams });
    }

    this.id = id;
    this.publicId = publicId;
    this.name = name;
    this.email = email;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
