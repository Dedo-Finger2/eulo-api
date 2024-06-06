import { InvalidEmailError } from "../../errors/invalid-email.js";
import { InvalidUserNameLengthError } from "../../errors/invalid-user-name-length.js";
import { MissingParameterError } from "../../errors/missing-parameter.js";
import { InputUserDto } from "../dto/user-dto.js";
import { User } from "./user.js";

describe("User Entity", () => {
  it.only("should create a new publicId for user", () => {
    const userDto = new InputUserDto({
      name: "Greg",
      email: "fake@email.com",
    });
    const user = User.build(userDto);

    expect(user).toBeInstanceOf(User);
    expect(user.publicId).toBeDefined();
  });

  it("should return a complete user entity", () => {
    const userDto = new InputUserDto({
      name: "Greg",
      email: "fake@email.com",
    });
    const user = User.build(userDto);

    expect(user).toBeInstanceOf(User);
    expect(user.name).toBe(userDto.name);
    expect(user.email).toBe(userDto.email);
  });

  it("should return InvalidEmailError when creating a new User with invalid email", () => {
    const userDto = new InputUserDto({
      name: "Greg",
      email: "invalid_email_.com",
    });
    const user = () => User.build(userDto);

    expect(user).toThrow(InvalidEmailError);
  });

  it("should return InvalidUserNameLengthError when creating a new User with invalid name", () => {
    const userDto = new InputUserDto({
      name: "1",
      email: "valid@email.com",
    });
    const user = () => User.build(userDto);

    expect(user).toThrow(InvalidUserNameLengthError);
  });

  it("should return MissingParameterError when creating a new User without passing DTO", () => {
    try {
      const user = () => User.build();
      user();

      expect(user).toThrow(MissingParameterError);
    } catch (error) {
      expect(error).toBeInstanceOf(MissingParameterError);
      expect(error.message).toBe("Missing parameters: userDto");
    }
  });

  it("should return MissingParameterError when userDto does not contain name", () => {
    try {
      const userDto = new InputUserDto({
        email: "email_only@gmail.com",
      });
      const user = () => User.build(userDto);
      user();

      expect(user).toThrow(MissingParameterError);
    } catch (error) {
      expect(error).toBeInstanceOf(MissingParameterError);
      expect(error.message).toBe("Missing parameters: name");
    }
  });

  it("should return MissingParameterError when userDto does not contain email", () => {
    try {
      const userDto = new InputUserDto({
        name: "greg",
      });
      const user = () => User.build(userDto);
      user();

      expect(user).toThrow(MissingParameterError);
    } catch (error) {
      expect(error).toBeInstanceOf(MissingParameterError);
      expect(error.message).toBe("Missing parameters: email");
    }
  });
});
