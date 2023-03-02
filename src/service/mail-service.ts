import nodemailer from "nodemailer";
import config from "config";
import db from "../../config/db";
import ApiError from "../exceptions/api-error";

class MailService {
  transporter: any;
  constructor() {
    this.transporter = nodemailer.createTransport(config.get("nodemailer"));
  }

  async sendActivationMail(to, code) {
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

  async checkEmail(email: string) {
    const user = await db.query(`SELECT * FROM users where email=$1`, [email]);
    switch (user.rows.length) {
      case 1:
        return {
          success: false,
          message: "данный email уже зарегистрирован",
        };
      case 0:
        return { success: true, message: "данный email не занят" };
      default:
        console.error(`Для email пользователя: ${email} сценарий не определен`);
        throw ApiError.BadRequest(`Ошибка проверки email ${email}`);
    }
  }
}

export = new MailService();
