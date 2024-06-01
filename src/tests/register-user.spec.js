import { app } from "../config/app.js";
import request from "supertest";

describe("RegisterUser", () => {
  it.skip("should return 200", async () => {
    const response = await request(app).post("/api/v1/users/register").send({
      name: "Username",
      email: "useremail@gmail.com",
    });

    expect(response.statusCode).toBe(200);
  });

  it("should return 400 if user email is invalid", async () => {
    const response = await request(app).post("/api/v1/users/register").send({
      name: "Username",
      email: "useremailgmail.com",
    });

    expect(response.statusCode).toBe(400);
  });

  it("should return 400 if user name is invalid", async () => {
    const response = await request(app).post("/api/v1/users/register").send({
      name: "U",
      email: "user@emailgmail.com",
    });

    expect(response.statusCode).toBe(400);
  });
});
