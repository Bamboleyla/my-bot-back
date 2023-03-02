import config from "config";
import { validationResult } from "express-validator";
import ApiError from "../exceptions/api-error";
import mailService from "../service/mail-service";
import phoneService from "../service/phone-service";
import tokenTGService from "../service/tokenTG-service";
import userService from "../service/user-service";

class AuthController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(
          ApiError.BadRequest("Ошибка при валидации", errors.array())
        );
      }
      const userData = await userService.registration(req.body);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.status(200).json(userData);
    } catch (e) {
      next(e);
    }
  }

  async login(req, res, next) {
    try {
      const userData = await userService.login(req.email, req.password);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.status(200).json(userData);
    } catch (e) {
      next(e);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie("refreshToken");
      return res.status(200).json(token);
    } catch (e) {
      next(e);
    }
  }

  async activate(req, res, next) {
    try {
      const { email, code } = req.body;
      const result = await userService.activate(email, code);
      if (result) return res.status(200).json({ success: true, message: "" });
      return res
        .status(200)
        .json({ success: false, message: "Неверный пароль" });
    } catch (e) {
      next(e);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await userService.refresh(refreshToken);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.status(200).json(userData);
    } catch (e) {
      next(e);
    }
  }

  async checkEmail(req, res, next) {
    try {
      const { email } = req.body;
      const result = await mailService.checkEmail(email);
      return res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  async checkPhone(req, res, next) {
    try {
      const { phone } = req.body;
      const result = await phoneService.checkPhone(phone);
      return res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  async checkTokenTG(req, res, next) {
    try {
      const { token } = req.body;
      const result = await tokenTGService.checkTokenTG(token);
      return res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      return res.json(users);
    } catch (e) {
      next(e);
    }
  }
}

export = new AuthController();
