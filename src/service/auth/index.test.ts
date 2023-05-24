import AuthService from ".";
import db from "../../../config/db";
import ApiError from "../../exceptions/api-error";
import bcrypt from "bcrypt";
import tokenService from "../token";

describe("AuthService", () => {
  describe("login", () => {
    const email = "test@example.com";
    const password = "testpassword";
    it('Если пользователь не найден, должен произойти вызов ApiError.BadRequest("Логин или Пароль указан неверно")', async () => {
      const response = {
        rows: [],
      };
      jest.spyOn(db, "query").mockResolvedValue(response);

      await expect(AuthService.login(email, password)).rejects.toThrow(
        ApiError.BadRequest("Логин или Пароль указан неверно")
      );
      expect(db.query).toHaveBeenCalledWith(
        `SELECT Id,Email,User_password FROM Users WHERE email=$1`,
        ["test@example.com"]
      );
    });

    it("Если пользователь найден, но пароль не верный", async () => {
      const response = {
        rows: [
          {
            user_password: "0000",
          },
        ],
      };
      jest.spyOn(db, "query").mockResolvedValue(response);

      await expect(AuthService.login(email, password)).rejects.toThrow(
        ApiError.BadRequest("Логин или Пароль указан неверно")
      );
      expect(db.query).toHaveBeenCalledWith(
        `SELECT Id,Email,User_password FROM Users WHERE email=$1`,
        ["test@example.com"]
      );
    });

    it("Если пользователь найден, пароль верный", async () => {
      const response = {
        rows: [
          {
            id: "1111",
            user_password: "0000",
          },
        ],
      };
      jest.spyOn(db, "query").mockResolvedValue(response);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
      jest.spyOn(tokenService, "generateTokens");

      await AuthService.login(email, password);

      expect(tokenService.generateTokens).toBeCalledWith({ id: "1111" });
      expect(db.query).toHaveBeenCalledWith(
        `SELECT Id,Email,User_password FROM Users WHERE email=$1`,
        ["test@example.com"]
      );
    });
  });
  describe("getAllUsers", () => {
    it("Должен произойти вызов db.query(`SELECT * FROM Users`)", async () => {
      jest.spyOn(db, "query").mockResolvedValue({ rows: [] });
      await AuthService.getAllUsers();
      expect(db.query).toBeCalledWith(`SELECT * FROM Users`);
    });
  });
});
