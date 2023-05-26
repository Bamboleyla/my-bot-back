import db from "../../../config/db";
import bcrypt from "bcrypt";
import ApiError from "../../exceptions/api-error";
import mailService from "../mail";
import tokenService from "../token";
import { Iregistration } from "./models";

class RegistrationService {
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
  }: Iregistration): Promise<string> {
    const hashPassword = await bcrypt.hash(password, 3);
    const code = Math.random().toString().slice(3, 7);
    const userID = await db.query(
      `INSERT INTO Users (first_name,middle_name,last_name,email,phone,country,city,tg_token,user_password,active_code) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING Id`,
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
        code,
      ]
    );
    if (userID.rows.length === 1) {
      await mailService.sendActivationMail(email, code);

      return tokenService.generateTokens({
        id: userID.rows[0].id,
      });
    } else
      throw ApiError.BadRequest(
        `Не удалось зарегистрировать пользователя c email: ${email}`
      );
  }

  async activate(email: string, code: string): Promise<boolean> {
    const user = await db.query(
      `SELECT Active_code FROM Users WHERE email=$1`,
      [email]
    );
    if (user.rows.length !== 1) {
      throw ApiError.BadRequest(`Не удалось найти учетную запись`);
    }
    if (user.rows[0].active_code === code) {
      await db.query(`UPDATE Users SET isActivated=$1 WHERE email=$2`, [
        true,
        email,
      ]);
      return true;
    }
    return false;
  }

  async changeActiveCode(email: string, code: string) {
    const user = await db.query(
      `SELECT Active_code, isActivated FROM Users WHERE email=$1`,
      [email]
    );
    if (user.rows.length !== 1) {
      throw ApiError.BadRequest(`Не удалось найти учетную запись`);
    }
    await db.query(`UPDATE Users SET Active_code=$1 WHERE email=$2`, [
      code,
      email,
    ]);
  }

  async changePassword(email: string, password: string) {
    await db.query(`UPDATE Users SET User_password=$1 WHERE email=$2`, [
      password,
      email,
    ]);
  }

  async isEmailCodeСorrect(email: string, code: string): Promise<boolean> {
    const user = await db.query(`SELECT * FROM Users WHERE email=$1`, [email]);
    if (user.rows.length !== 1) {
      throw ApiError.BadRequest(`Не удалось найти учетную запись`);
    }
    return user.rows[0].active_code === code;
  }
}

export = new RegistrationService();
