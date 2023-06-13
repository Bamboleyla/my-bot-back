import mailService from "../service/mail";
import bcrypt from "bcrypt";
import ApiError from "../exceptions/api-error";
import registrationService from "../service/registration";

class ForgetPasswordController {
  async sendСodeToEmail(req: { body: { email: string } }, res, next) {
    try {
      const { email } = req.body;
      const code = Math.random().toString().slice(3, 7);
      await registrationService.changeActiveCode(email, code);
      await mailService.sendActivationMail(email, code);

      return res.status(200).json();
    } catch (e) {
      next(e);
    }
  }

  async changePassword(
    req: { body: { email: string; code: string; password: string } },
    res,
    next
  ) {
    try {
      const { email, code, password } = req.body;
      const isEmailCodeСorrect = await registrationService.isEmailCodeСorrect(
        email,
        code
      );
      if (isEmailCodeСorrect) {
        const hashPassword = await bcrypt.hash(password, 3);
        await registrationService.changePassword(email, hashPassword);
        return res.status(200).json();
      }
      throw ApiError.BadRequest(`Неверный код`);
    } catch (e) {
      next(e);
    }
  }
}

export = new ForgetPasswordController();
