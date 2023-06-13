import ForgetPasswordController from "./forgetPassword.controller";
import registrationService from "../service/registration";
import mailService from "../service/mail";
import ApiError from "../exceptions/api-error";
import bcrypt from "bcrypt";

describe("ForgetPasswordController", () => {
  const { sendСodeToEmail, changePassword } = ForgetPasswordController;

  let req = {},
    res,
    json,
    next;

  beforeEach(() => {
    json = jest.fn();
    res = {
      status: jest.fn(() => ({
        json,
      })),
    };
    next = jest.fn();
  });

  describe("sendСodeToEmail", () => {
    const req = { body: { email: "email@example.com" } };
    it("Если при выполнении кода возникает ошибка, должен произойти вызов next(e)", async () => {
      const err = new Error();

      jest
        .spyOn(registrationService, "changeActiveCode")
        .mockRejectedValue(err);

      await sendСodeToEmail(req, res, next);

      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(err);
    });

    it(`Если успешно выполнились registrationService.changeActiveCode(email, code),mailService.sendActivationMail(email, code)
    должен произойти вызов res.status(200).json()`, async () => {
      jest.spyOn(registrationService, "changeActiveCode").mockResolvedValue();
      jest.spyOn(mailService, "sendActivationMail").mockResolvedValue();

      await sendСodeToEmail(req, res, next);

      expect(registrationService.changeActiveCode).toHaveBeenCalled();
      expect(mailService.sendActivationMail).toHaveBeenCalled();
      expect(res.status).toBeCalledWith(200);
      expect(json).toBeCalledTimes(1);
    });
  });
  describe("changePassword", () => {
    const req = {
      body: { email: "email@example.com", code: "1111", password: "1234" },
    };
    it("Если при выполнении кода возникает ошибка, должен произойти вызов next(e)", async () => {
      const err = new Error();

      jest
        .spyOn(registrationService, "isEmailCodeСorrect")
        .mockRejectedValue(err);

      await changePassword(req, res, next);

      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(err);
    });

    it("Если isEmailCodeСorrect === false, тогда должен произойти вызов throw ApiError.BadRequest(`Неверный код`)", async () => {
      jest
        .spyOn(registrationService, "isEmailCodeСorrect")
        .mockResolvedValue(false);
      jest.spyOn(ApiError, "BadRequest");

      await changePassword(req, res, next);

      expect(registrationService.isEmailCodeСorrect).toBeCalledWith(
        "email@example.com",
        "1111"
      );
      expect(ApiError.BadRequest).toBeCalledWith(`Неверный код`);
    });

    it(`Если isEmailCodeСorrect === true, тогда должны произойти вызовы:
    bcrypt.hash(password, 3)
    registrationService.changePassword(email, hashPassword)
    res.status(200).json()`, async () => {
      jest
        .spyOn(registrationService, "isEmailCodeСorrect")
        .mockResolvedValue(true);
      jest.spyOn(bcrypt, "hash").mockResolvedValue("h@sh");
      jest.spyOn(registrationService, "changePassword").mockResolvedValue();

      await changePassword(req, res, next);

      expect(registrationService.isEmailCodeСorrect).toBeCalledWith(
        "email@example.com",
        "1111"
      );
      expect(bcrypt.hash).toBeCalledWith("1234", 3);
      expect(registrationService.changePassword).toBeCalledWith(
        "email@example.com",
        "h@sh"
      );
      expect(res.status).toBeCalledWith(200);
      expect(json).toBeCalledTimes(1);
    });
  });
});
