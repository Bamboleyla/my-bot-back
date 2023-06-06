import jwt from "jsonwebtoken";
import config from "config";
import TokenService from ".";

describe("TokenService", () => {
  describe("generateTokens", () => {
    it('При вызове generateTokens(payload) должен произойти вызов jwt.sign(payload, config.get("jwt-access-secret") с соответствующими аргументами', () => {
      jest.spyOn(jwt, "sign");
      TokenService.generateTokens({ id: 1111 });

      expect(jwt.sign).toBeCalledWith(
        { id: 1111 },
        config.get("jwt-access-secret"),
        {
          expiresIn: "7d",
        }
      );
    });
  });
  describe("validateToken", () => {
    const token = "t0k3n";
    it(`При вызове validateToken(token: string) должен произойти вызов
     jwt.verify(token, config.get("jwt-access-secret")`, () => {
      jest.spyOn(jwt, "verify");

      TokenService.validateToken(token);

      expect(jwt.verify).toBeCalledWith(token, config.get("jwt-access-secret"));
    });

    it(`Если токен неверный должна выкинутся ошибка и вернутся NULL`, () => {
      const result = TokenService.validateToken(token);

      expect(result).toBeNull();
    });
  });
});
