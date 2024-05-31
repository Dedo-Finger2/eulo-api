import nodemailer from "nodemailer";

export class MailtrapMailService {
  transporter;

  constructor() {
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
