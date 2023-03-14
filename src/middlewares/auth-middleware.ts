import ApiError from "../exceptions/api-error";
import tokenService from "../service/token";

export default (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedError());
    }

    const accessToken = authorizationHeader.split(" ")[1];
    if (!accessToken) {
      return next(ApiError.UnauthorizedError());
    }

    const userData = tokenService.validateToken(accessToken);
    if (!userData) {
      return next(ApiError.UnauthorizedError());
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
