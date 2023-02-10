const nodemailer = require("nodemailer");
const config = require("config");

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport(config.get("nodemailer"));
  }

  async sendActivationMail(to, link) {
    await this.transporter.sendMail({
      from: config.get("nodemailer").auth.user,
      to,
      subject: "Активация аккаунта на " + config.get("api_url"),
      text: "",
      html: `
                    <div>
                        <h1>Для активации перейдите по ссылке</h1>
                        <a href="${link}">${link}</a>
                    </div>
                `,
    });
  }
}

module.exports = new MailService();
