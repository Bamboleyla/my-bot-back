import db from "../../config/db";
import bcrypt from "bcrypt";
import uuid from "uuid";
import config from "config";
import mailService from "./mail-service";
import tokenService from "./token-service";
import UserDto from "../dtos/user-dto";
import ApiError from "../exceptions/api-error";

class UserService {
  async registration({
    firstName,
    lastName,
    middleName,
    phoneNumber,
    email,
    country,
    city,
    tgToken,
    password,
  }) {
    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuid.v4();
    const userID = await db.query(
      `INSERT INTO Users (first_name,middle_name,last_name,email,phone,country,city,tg_token,user_password,active_link) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING Id,Email,Isactivated`,
      [
        firstName,
        middleName,
        lastName,
        email,
        phoneNumber,
        country,
        city,
        tgToken,
        hashPassword,
        activationLink,
      ]
    );
    if (userID.rows.length === 1) {
      await mailService.sendActivationMail(
        email,
        `${config.get("api_url")}/api/activate/${activationLink}`
      );
      await db.query(`INSERT INTO Tokens (user_id) VALUES($1)`, [
        userID.rows[0].id,
      ]);
      const usetDto = new UserDto(userID.rows[0]);
      const tokens = tokenService.generateTokens({
        ...usetDto,
      });
      await tokenService.saveToken(userID.rows[0].id, tokens.refreshToken);
      return { ...tokens, user: usetDto };
    } else
      throw ApiError.BadRequest(
        `Не удалось зарегистрировать пользователя c email: ${email}`
      );
  }

  async activate(activationLink) {
    const user = await db.query(`SELECT Id FROM Users WHERE active_link=$1`, [
      activationLink,
    ]);
    if (user.rows.length !== 1) {
      throw ApiError.BadRequest(
        `Неккоректная ссылка активации ${activationLink}`
      );
    }
    await db.query(`UPDATE Users SET isActivated=$1 WHERE id=$2`, [
      true,
      user.rows[0].id,
    ]);
  }

  async login(email, password) {
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

  async logout(refreshToken) {
    await tokenService.removeToken(refreshToken);
    return { status: "Ok" };
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.BadRequest("Ошибка авторизации");
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
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

export = new UserService();
