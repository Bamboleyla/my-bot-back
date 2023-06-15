import { app } from "../../index";
import request from "supertest";
import RegistrationController from "./registration.controller";
import registrationService from "../service/registration";
import mailService from "../service/mail";
import phoneService from "../service/phone";
import tokenTGService from "../service/tokenTG";

describe("RegistrationController", () => {
  const { registration, activate, checkEmail, checkPhone, checkTokenTG } =
    RegistrationController;

  const req = {},
    error = new Error();
  let json, res, next;

  beforeEach(() => {
    json = jest.fn();
    res = {
      cookie: jest.fn(),
      status: jest.fn(() => ({ json })),
    };
    next = jest.fn();
  });

  describe("registration", () => {
    it('Если в процессе валидации запроса возникли ошибки, должен быть вызван ApiError.BadRequest("Ошибка при валидации", errors.array())', async () => {
      const response = await request(app).post("/api/registration"); // Запрос без необходимых полей для валидации, чтобы вызвать ошибки

      const { message, errors } = response.body;

      expect(message).toBe("Ошибка при валидации");
      expect(errors).toHaveLength(2);
    });

    it(`Если запрос прошел валидацию, должны произойти вызовы
    res.cookie("token", token, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
    res.status(200).json(true);`, async () => {
      jest
        .spyOn(registrationService, "registration")
        .mockResolvedValue("t0ken");

      await registration(req, res, next);

      expect(res.cookie).toBeCalledWith("token", "t0ken", {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      expect(res.status).toBeCalledWith(200);
      expect(json).toBeCalledWith(true);
    });

    it("Если в процессе выполнения кода, произошла ошибка, должен произойти вызов next(e)", async () => {
      jest.spyOn(registrationService, "registration").mockRejectedValue(error);

      await registration(req, res, next);

      expect(next).toBeCalledWith(error);
    });
  });

  describe("activate", () => {
    const req = { body: { email: "example@com", code: "1111" } };
    it("Если активация пользователя прошла успешно (await registrationService.activate(email, code)=>true)", async () => {
      jest.spyOn(registrationService, "activate").mockResolvedValue(true);

      await activate(req, res, next);

      expect(res.status).toBeCalledWith(200);
      expect(json).toBeCalledWith({ success: true, message: "" });
    });

    it("Если активация пользователя прошла неудачно (await registrationService.activate(email, code)=>false)", async () => {
      jest.spyOn(registrationService, "activate").mockResolvedValue(false);

      await activate(req, res, next);

      expect(res.status).toBeCalledWith(200);
      expect(json).toBeCalledWith({
        success: false,
        message: "Неверный пароль",
      });
    });

    it("Если в процессе выполнения кода, произошла ошибка, должен произойти вызов next(e)", async () => {
      jest.spyOn(registrationService, "activate").mockRejectedValue(error);

      await activate(req, res, next);

      expect(next).toBeCalledWith(error);
    });
  });

  describe("checkEmail", () => {
    const req = { body: { email: "example@com" } };
    it("Если удалось найти пользователя по email (await mailService.checkEmail(email)=>true)", async () => {
      jest.spyOn(mailService, "checkEmail").mockResolvedValue(true);

      await checkEmail(req, res, next);

      expect(res.status).toBeCalledWith(200);
      expect(json).toBeCalledWith(true);
    });

    it("Если не удалось найти пользователя по email (await mailService.checkEmail(email)=>false)", async () => {
      jest.spyOn(mailService, "checkEmail").mockResolvedValue(false);

      await checkEmail(req, res, next);

      expect(res.status).toBeCalledWith(200);
      expect(json).toBeCalledWith(false);
    });

    it("Если в процессе выполнения кода, произошла ошибка, должен произойти вызов next(e)", async () => {
      jest.spyOn(mailService, "checkEmail").mockRejectedValue(error);

      await checkEmail(req, res, next);

      expect(next).toBeCalledWith(error);
    });
  });

  describe("checkPhone", () => {
    const req = { body: { phone: "+1234567890" } };
    it("Если удалось найти пользователя по phone (await phoneService.checkPhone(phone)=>true)", async () => {
      jest.spyOn(phoneService, "checkPhone").mockResolvedValue(true);

      await checkPhone(req, res, next);

      expect(res.status).toBeCalledWith(200);
      expect(json).toBeCalledWith(true);
    });

    it("Если не удалось найти пользователя по email (await phoneService.checkPhone(phone)=>false)", async () => {
      jest.spyOn(phoneService, "checkPhone").mockResolvedValue(false);

      await checkPhone(req, res, next);

      expect(res.status).toBeCalledWith(200);
      expect(json).toBeCalledWith(false);
    });

    it("Если в процессе выполнения кода, произошла ошибка, должен произойти вызов next(e)", async () => {
      jest.spyOn(phoneService, "checkPhone").mockRejectedValue(error);

      await checkPhone(req, res, next);

      expect(next).toBeCalledWith(error);
    });
  });

  describe("checkTokenTG", () => {
    const req = { body: { token: "t0ken" } };
    it("Если удалось найти пользователя по phone (await tokenTGService.checkTokenTG(token)=>true)", async () => {
      jest.spyOn(tokenTGService, "checkTokenTG").mockResolvedValue(true);

      await checkTokenTG(req, res, next);

      expect(res.status).toBeCalledWith(200);
      expect(json).toBeCalledWith(true);
    });

    it("Если не удалось найти пользователя по email (await tokenTGService.checkTokenTG(token)=>false)", async () => {
      jest.spyOn(tokenTGService, "checkTokenTG").mockResolvedValue(false);

      await checkTokenTG(req, res, next);

      expect(res.status).toBeCalledWith(200);
      expect(json).toBeCalledWith(false);
    });

    it("Если в процессе выполнения кода, произошла ошибка, должен произойти вызов next(e)", async () => {
      jest.spyOn(tokenTGService, "checkTokenTG").mockRejectedValue(error);

      await checkTokenTG(req, res, next);

      expect(next).toBeCalledWith(error);
    });
  });
});
