import nodemailer from "nodemailer";
import config from "config";
import db from "../../config/db";
import { validateDbResponse } from "../shared/validateDbResponse";

class MailService {
  transporter: any;
  constructor() {
    this.transporter = nodemailer.createTransport(config.get("nodemailer"));
  }

  async sendActivationMail(to: string, code: string) {
    await this.transporter.sendMail({
      from: config.get("nodemailer").auth.user,
      to,
      subject: "Активация аккаунта",
      text: "",
      html: `
                    <div>
                        Код активации акаунта
                        <h1>${code}</h1>
                    </div>
                `,
    });
  }

  async checkEmail(email: string): Promise<boolean> {
    const result = await db.query(`SELECT * FROM users where email=$1`, [
      email,
    ]);
    return Boolean(validateDbResponse(result));
  }
}

export = new MailService();
