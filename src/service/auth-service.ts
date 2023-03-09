import db from "../../config/db";
import bcrypt from "bcrypt";
import ApiError from "../exceptions/api-error";
import tokenService from "./token-service";
import UserDto from "../dtos/user-dto";

class AuthService {
  async login(email: string, password: string) {
    const user = await db.query(
      `SELECT Id,Email,User_password, isactivated FROM Users WHERE email=$1`,
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
    const userDto = new UserDto(user.rows[0]);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw ApiError.BadRequest("Ошибка авторизации");
    }
    const userData = tokenService.validateToken(refreshToken, "refresh");
    const { rows } = await db.query(
      `SELECT user_id FROM Tokens WHERE token=$1`,
      [refreshToken]
    );
    if (!userData || rows.length !== 1) {
      throw ApiError.BadRequest("Ошибка авторизации");
    }
    const user = await db.query(
      `SELECT Id,Email,Isactivated FROM Users WHERE Id=$1`,
      [rows.user_id]
    );
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async getAllUsers() {
    const { rows } = await db.query(`SELECT * FROM Users`);
    return rows;
  }
}

export = new AuthService();
