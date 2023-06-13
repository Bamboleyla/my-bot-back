import AuthController from "./auth.controller";
import authService from "../service/auth";

describe("AuthController", () => {
  const { login, logout, getUsers } = AuthController;
  let json,
    req = {},
    res,
    next;

  beforeEach(() => {
    json = jest.fn();
    res = {
      cookie: jest.fn(),
      status: jest.fn(() => ({
        json,
      })),
      clearCookie: jest.fn(),
    };
    next = jest.fn();
  });
  describe("login", () => {
    it("Если при выполнении кода возникнет ошибка, должен произойти вызов next(e)", () => {
      login(req, res, next);
      expect(next).toBeCalledTimes(1);
    });

    it("Если получилось получить токен, тогда должен произойти вызов res.status(200).json()", async () => {
      req = {
        body: {
          email: "email@example.com",
          password: "1234",
        },
      };

      jest.spyOn(authService, "login").mockResolvedValue("t0ken");

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.cookie).toBeCalledWith("token", "t0ken", {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      expect(json).toHaveBeenCalledTimes(1);
    });
  });

  describe("logout", () => {
    it("Если при выполнении кода возникнет ошибка, должен произойти вызов next(e)", () => {
      res = {};

      logout(req, res, next);

      expect(next).toBeCalledTimes(1);
    });

    it("Если получилось очистить cookie, тогда должен произойти вызов res.status(200).json()", async () => {
      req = {
        body: {
          email: "email@example.com",
          password: "1234",
        },
      };

      await logout(req, res, next);

      expect(res.clearCookie).toBeCalledWith("token");
      expect(res.status).toBeCalledWith(200);
      expect(json).toHaveBeenCalledTimes(1);
    });
  });

  describe("getUsers", () => {
    it("Если при выполнении кода возникнет ошибка, должен произойти вызов next(e)", async () => {
      const err = new Error();
      jest.spyOn(authService, "getAllUsers").mockRejectedValue(err);

      await getUsers(req, res, next);

      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(err);
    });

    it("Если получилось получить список пользователей, тогда должен произойти вызов res.json({ users, new_token: req.user })", async () => {
      const req = {
        user: "test",
      };

      res = { json };

      const users = [1, 2, 3, 4];

      jest.spyOn(authService, "getAllUsers").mockResolvedValue(users);

      await getUsers(req, res, next);

      expect(json).toHaveBeenCalledWith({ users, new_token: req.user });
    });
  });
});
