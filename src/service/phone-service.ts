import ApiError from "../exceptions/api-error";
import db from "../../config/db";

class PhoneService {
  async checkPhone(phone: string) {
    const user = await db.query(`SELECT * FROM users where phone=$1`, [
      `+${phone.match(/\d/g).join("")}`,
    ]);
    switch (user.rows.length) {
      case 1:
        return {
          success: false,
          message: "данный номер телефона уже зарегистрирован",
        };
      case 0:
        return { success: true, message: "данный phone number не занят" };
      default:
        console.error(`Для phone пользователя: ${phone} сценарий не определен`);
        throw ApiError.BadRequest(`Ошибка проверки phone ${phone}`);
    }
  }
}

export = new PhoneService();
