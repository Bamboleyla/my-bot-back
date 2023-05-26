import db from "../../../config/db";
import mailService from "../mail";
import tokenService from "../token";
import bcrypt from "bcrypt";
import RegistrationService from "./";
import ApiError from "../../exceptions/api-error";

describe("RegistrationService", () => {
  const mockData = {
    firstName: "First",
    lastName: "Last",
    middleName: "Middle",
    phoneNumber: "12345678",
    email: "test@example.com",
    country: "Test Country",
    city: "Test City",
    tgToken: "t0k3n",
    password: "testPassword",
  };
  const { email, password } = mockData;
  const active_code = "0000";
  describe("registration", () => {
    beforeEach(() => {
      jest.spyOn(db, "query").mockResolvedValue({
        rows: [
          {
            id: "1",
          },
        ],
      });

      jest
        .spyOn(bcrypt, "hash")
        .mockImplementation(() => Promise.resolve("hashedPassword"));
      jest.spyOn(Math, "random").mockReturnValue(0.12345);
      jest
        .spyOn(mailService, "sendActivationMail")
        .mockImplementation(() => Promise.resolve());
      jest
        .spyOn(tokenService, "generateTokens")
        .mockReturnValue("generatedToken");
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("Должен произойти вызов к db для записи нового пользователя", async () => {
      await RegistrationService.registration(mockData);

      expect(db.query).toHaveBeenCalledWith(
        `INSERT INTO Users (first_name,middle_name,last_name,email,phone,country,city,tg_token,user_password,active_code) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING Id`,
        [
          mockData.firstName,
          mockData.middleName,
          mockData.lastName,
          mockData.email,
          mockData.phoneNumber,
          mockData.country,
          mockData.city,
          mockData.tgToken,
          "hashedPassword",
          "2345",
        ]
      );
    });

    it("Должен произойти вызов mailService.sendActivationMail(email, code)", async () => {
      await RegistrationService.registration(mockData);

      expect(mailService.sendActivationMail).toHaveBeenCalledWith(
        mockData.email,
        "2345"
      );
    });

    it("Должен произойти вызов tokenService.generateTokens({ id: userID.rows[0].id })", async () => {
      const generatedToken = await RegistrationService.registration(mockData);

      expect(generatedToken).toEqual("generatedToken");
    });

    it("Если не удалось создать нового пользователя должен произойти вызов ApiError.BadRequest( Не удалось зарегистрировать пользователя c email: ${email} )", async () => {
      jest.spyOn(db, "query").mockResolvedValue({
        rows: [],
      });

      await expect(
        RegistrationService.registration(mockData)
      ).rejects.toThrowError(
        "Не удалось зарегистрировать пользователя c email: test@example.com"
      );
    });
  });

  describe("activate", () => {
    it(`Если пользователь будет найден по email, должны произойти вызовы:
   await db.query( 'SELECT Active_code FROM Users WHERE email=$1', [email] ),
   await db.query('UPDATE Users SET isActivated=$1 WHERE email=$2', [ true, email ])`, async () => {
      jest.spyOn(db, "query").mockResolvedValue({
        rows: [{ active_code }],
      });

      expect(
        await RegistrationService.activate(email, active_code)
      ).toBeTruthy();
      expect(db.query).toBeCalledWith(
        "SELECT Active_code FROM Users WHERE email=$1",
        [email]
      );
      expect(db.query).toBeCalledWith(
        "UPDATE Users SET isActivated=$1 WHERE email=$2",
        [true, email]
      );
    });

    it(`Если не удалось найти пользователя по email должны произойти вызовы:
    throw ApiError.BadRequest('Не удалось найти учетную запись')`, async () => {
      jest.spyOn(db, "query").mockResolvedValue({
        rows: [],
      });

      await expect(
        RegistrationService.activate(email, active_code)
      ).rejects.toThrow(ApiError.BadRequest(`Не удалось найти учетную запись`));
    });

    it(`Если пользователь будет найден по email, но active_code !== code должны произойти вызов:
    await db.query( 'SELECT Active_code FROM Users WHERE email=$1', [email] ),
    и вернутся false`, async () => {
      jest.spyOn(db, "query").mockResolvedValue({
        rows: [{ active_code: "1111" }],
      });

      expect(
        await RegistrationService.activate(email, active_code)
      ).toBeFalsy();
      expect(db.query).toBeCalledWith(
        "SELECT Active_code FROM Users WHERE email=$1",
        [email]
      );
    });
  });

  describe("changeActiveCode", () => {
    const code = "1234";
    it(`При успешном поиске пользователя по email, должен произойти вызовы:
    await db.query( SELECT Active_code, isActivated FROM Users WHERE email=$1, [email]),
    await db.query(UPDATE Users SET Active_code=$1 WHERE email=$2, [ code, email ])`, async () => {
      jest.spyOn(db, "query").mockResolvedValue({
        rows: [{}],
      });
      await RegistrationService.changeActiveCode(email, code);
      expect(db.query).toBeCalledWith(
        `SELECT Active_code, isActivated FROM Users WHERE email=$1`,
        [email]
      );
      expect(db.query).toBeCalledWith(
        `UPDATE Users SET Active_code=$1 WHERE email=$2`,
        [code, email]
      );
    });

    it(`Если неудалось найти пользователя по email, должен произойти вызовы:
    await db.query( SELECT Active_code, isActivated FROM Users WHERE email=$1, [email]),
    ApiError.BadRequest(Не удалось найти учетную запись)`, async () => {
      jest.spyOn(db, "query").mockResolvedValue({
        rows: [],
      });
      await expect(
        RegistrationService.changeActiveCode(email, code)
      ).rejects.toThrow(ApiError.BadRequest("Не удалось найти учетную запись"));
      expect(db.query).toBeCalledWith(
        `SELECT Active_code, isActivated FROM Users WHERE email=$1`,
        [email]
      );
    });
  });

  describe("changePassword", () => {
    it(`При вызове changePassword(email, password) должен выполнятся запрос к db
    db.query(UPDATE Users SET User_password=$1 WHERE email=$2, [ password, email ]`, async () => {
      jest.spyOn(db, "query");

      await RegistrationService.changePassword(email, password);

      expect(db.query).toBeCalledWith(
        "UPDATE Users SET User_password=$1 WHERE email=$2",
        [password, email]
      );
    });
  });

  describe("isEmailCodeСorrect", () => {
    it(`Если произошел успешный поиск пользователя и user.rows[0].active_code === code должен произойти вызов
    await db.query(SELECT * FROM Users WHERE email=$1, [email]) и вернутся true`, async () => {
      jest.spyOn(db, "query").mockResolvedValue({
        rows: [{ active_code }],
      });

      expect(
        await RegistrationService.isEmailCodeСorrect(email, "0000")
      ).toBeTruthy();
      expect(db.query).toBeCalledWith("SELECT * FROM Users WHERE email=$1", [
        email,
      ]);
    });

    it(`Если произошел успешный поиск пользователя и user.rows[0].active_code !== code должен произойти вызов
    await db.query(SELECT * FROM Users WHERE email=$1, [email]) и вернутся false`, async () => {
      jest.spyOn(db, "query").mockResolvedValue({
        rows: [{ active_code }],
      });

      expect(
        await RegistrationService.isEmailCodeСorrect(email, "1111")
      ).toBeFalsy();
      expect(db.query).toBeCalledWith("SELECT * FROM Users WHERE email=$1", [
        email,
      ]);
    });

    it("Если неудалось найти пользователя, должен произойти вызов throw ApiError.BadRequest(Не удалось найти учетную запись)", async () => {
      jest.spyOn(db, "query").mockResolvedValue({
        rows: [],
      });

      await expect(
        RegistrationService.isEmailCodeСorrect(email, "1111")
      ).rejects.toThrow(ApiError.BadRequest("Не удалось найти учетную запись"));
    });
  });
});
