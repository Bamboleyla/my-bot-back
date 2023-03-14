import authService from "../service/auth";

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const token = await authService.login(email, password);
      res.cookie("token", token, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.status(200).json();
    } catch (e) {
      next(e);
    }
  }

  async logout(req, res, next) {
    try {
      res.clearCookie("token");
      return res.status(200).json();
    } catch (e) {
      next(e);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await authService.getAllUsers();
      return res.json({ users, new_token: req.user });
    } catch (e) {
      next(e);
    }
  }
}

export = new AuthController();
