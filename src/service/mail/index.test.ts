import mail from ".";
import MailService from ".";
import db from "../../../config/db";

describe("MailService", () => {
  const email = "test@example.com";
  const code = "1234";
  describe("sendActivationMail", () => {
    it("При вызове sendActivationMail должен произойти вызов this.transporter.sendMail() с определенными параметрами", async () => {
      const mockTransporter = { sendMail: jest.fn() };

      MailService.transporter = mockTransporter;

      await MailService.sendActivationMail(email, code);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: "chatbotsinfo@mail.ru",
        to: "test@example.com",
        subject: "Активация аккаунта",
        text: "",
        html: `
                    <div>
                        Код активации акаунта
                        <h1>${code}</h1>
                    </div>
                `,
      });
    });
  });
  describe("checkEmail", () => {
    it("Если email уже зарегестрирован должено вернутся true", async () => {
      const result = {
        rows: [
          {
            id: 1,
            user: "Test",
          },
        ],
      };
      jest.spyOn(db, "query").mockResolvedValue(result);

      expect(await MailService.checkEmail(email)).toBeTruthy();
      expect(db.query).toHaveBeenCalledWith(
        `SELECT * FROM users where email=$1`,
        [email]
      );
    });

    it("Если email не зарегестрирован должено вернутся false", async () => {
      const result = {
        rows: [],
      };
      jest.spyOn(db, "query").mockResolvedValue(result);

      expect(await MailService.checkEmail(email)).toBeFalsy();
      expect(db.query).toHaveBeenCalledWith(
        `SELECT * FROM users where email=$1`,
        [email]
      );
    });
  });
});
