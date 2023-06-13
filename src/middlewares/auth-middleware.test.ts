import ApiError from "../exceptions/api-error";
import tokenService from "../service/token";
import authMiddleware from "./auth-middleware";

describe("Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };

    res = {
      cookie: jest.fn(),
    };

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Если !req.headers.authorization, тогда должнен произойти вызов ApiError.UnauthorizedError()", () => {
    authMiddleware(req, res, next);

    expect(next).toBeCalledTimes(1);
    expect(next).toBeCalledWith(ApiError.UnauthorizedError());
  });

  it('Если !authorizationHeader.split(" ")[1], тогда должнен произойти вызов ApiError.UnauthorizedError()', () => {
    req = { headers: { authorization: "t0ken" } };

    authMiddleware(req, res, next);

    expect(next).toBeCalledTimes(1);
    expect(next).toBeCalledWith(ApiError.UnauthorizedError());
  });

  it("Если token не валидный !tokenService.validateToken(accessToken), тогда должен произойти вызов next(ApiError.UnauthorizedError())", () => {
    req = { headers: { authorization: "Beaber t0ken" } };

    jest.spyOn(tokenService, "validateToken");

    authMiddleware(req, res, next);

    expect(tokenService.validateToken).toBeCalledWith("t0ken");
    expect(next).toBeCalledTimes(1);
    expect(next).toBeCalledWith(ApiError.UnauthorizedError());
  });

  it('Если date - userData.iat > 60 * 60 * 24 тогда должен произойти вызов res.cookie("token", token, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, })', () => {
    req = { headers: { authorization: "Beaber t0ken" } };
    const t0ken = {
      email: "email",
      id: 1234,
      isActivated: false,
      exp: 1,
      iat: 100,
    };

    jest.spyOn(tokenService, "validateToken").mockReturnValue(t0ken);
    jest.spyOn(tokenService, "generateTokens").mockReturnValue("newT0ken");

    authMiddleware(req, res, next);

    expect(tokenService.validateToken).toBeCalledWith("t0ken");
    expect(tokenService.generateTokens).toBeCalledWith({ id: 1234 });
    expect(res.cookie).toBeCalledWith("token", "newT0ken", {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    expect(next).toBeCalledTimes(1);
  });
});
