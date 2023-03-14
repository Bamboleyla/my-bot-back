import db from "../../../config/db";
import bcrypt from "bcrypt";
import ApiError from "../../exceptions/api-error";
import tokenService from "../token";

class AuthService {
  async login(email: string, password: string) {
    const user = await db.query(
      `SELECT Id,Email,User_password FROM Users WHERE email=$1`,
      [email]
    );
    if (user.rows.length !== 1) {
      throw ApiError.BadRequest("Пользователь с таким email не найден");
    }
    const isPassEquals = await bcrypt.compare(
      password,
      user.rows[0].user_password
    );
    if (!isPassEquals) {
      throw ApiError.BadRequest("Неверный пароль");
    }

    return tokenService.generateTokens({ id: user.rows[0].id });
  }

  async getAllUsers() {
    const { rows } = await db.query(`SELECT * FROM Users`);
    return rows;
  }
}

export = new AuthService();
