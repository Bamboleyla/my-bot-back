import ApiError from "../exceptions/api-error";
import db from "../../config/db";

class TokenTGService {
  async checkTokenTG(token: string) {
    const user = await db.query(`SELECT * FROM users where tg_token=$1`, [
      token,
    ]);
    switch (user.rows.length) {
      case 1:
        return {
          success: false,
          message: "данный telegram token уже зарегистрирован",
        };
      case 0:
        return { success: true, message: "данный telegram token не занят" };

      default:
        console.error(
          `Для tokenTG пользователя: ${token} сценарий не определен`
        );
        throw ApiError.BadRequest(`Ошибка проверки tokenTG ${token}`);
    }
  }
}

export = new TokenTGService();
