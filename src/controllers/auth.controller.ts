import tokenService from "../service/token-service";
import authService from "../service/auth-service";

class AuthController {
  async login(req, res, next) {
    try {
      const userData = await authService.login(req.email, req.password);
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
      await tokenService.removeToken(refreshToken);
      res.clearCookie("refreshToken");
      return res.status(200).json();
    } catch (e) {
      next(e);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await authService.refresh(refreshToken);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.status(200).json(userData);
    } catch (e) {
      next(e);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await authService.getAllUsers();
      return res.json(users);
    } catch (e) {
      next(e);
    }
  }
}

export = new AuthController();
