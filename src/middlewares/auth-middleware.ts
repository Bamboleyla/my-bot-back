import ApiError from "../exceptions/api-error";
import tokenService from "../service/token";

export default (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      throw new Error("Отсутствует заголовок");
    }

    const accessToken = authorizationHeader.split(" ")[1];
    if (!accessToken) {
      throw new Error("Отсутствует токен");
    }

    const userData = tokenService.validateToken(accessToken);
    if (!userData) {
      throw new Error("Токен не валиден");
    }

    const date = Date.now() / 1000;
    if (date - userData.iat > 60 * 60 * 24) {
      const token = tokenService.generateTokens({ id: userData.id });

      res.cookie("token", token, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
    }

    req.user_id = userData.id;
    next();
  } catch (e) {
    return next(ApiError.UnauthorizedError());
  }
};
