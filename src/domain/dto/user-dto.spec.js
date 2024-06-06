import { InputUserDto, OutputUserDto } from "./user-dto.js";

describe("InputUserDto", () => {
  it("should return name and email", () => {
    const userData = {
      name: "greg",
      email: "greg@gmail.com",
    };
    const response = new InputUserDto(userData);

    expect(response).toBeInstanceOf(InputUserDto);
    expect(response.name).toBe(userData.name);
    expect(response.email).toBe(userData.email);
  });
});

describe("OutputUserDto", () => {
  it("should return name and email", () => {
    const userData = {
      id: 1,
      publicId: crypto.randomUUID(),
      name: "greg",
      email: "greg@gmail.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const response = new OutputUserDto(userData);

    expect(response).toBeInstanceOf(OutputUserDto);
    expect(response.id).toBe(userData.id);
    expect(response.publicId).toBe(userData.publicId);
    expect(response.name).toBe(userData.name);
    expect(response.email).toBe(userData.email);
    expect(response.createdAt).toBe(userData.createdAt);
    expect(response.updatedAt).toBe(userData.updatedAt);
  });
});
