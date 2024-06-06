import nodemailer from "nodemailer";
import { MailService } from "./mail";
import { MissingParameterError } from "../errors/missing-parameter.js";

export class MailtrapMailService extends MailService {
  transporter;

  constructor() {
    super();
    this.transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "9ab76e9faf26d8",
        pass: "2433cf46ccdb64",
      },
    });
  }

  async sendMail(message) {
    if (!message) throw new MissingParameterError({ parameters: ["message"] });

    await this.transporter.sendMail({
      to: {
        name: message.to.name,
        address: message.to.address,
      },
      from: {
        name: message.from.name,
        address: message.from.address,
      },
      subject: message.subject,
      html: message.html,
    });
  }
}
