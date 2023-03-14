import jwt from "jsonwebtoken";
import config from "config";
import { IvalidateToken } from "./models";

class TokenService {
  generateTokens(payload): string {
    return jwt.sign(payload, config.get("jwt-access-secret"), {
      expiresIn: "7d",
    });
  }

  validateToken(token: string): IvalidateToken | null {
    try {
      const userData = jwt.verify(token, config.get("jwt-access-secret"));
      return userData;
    } catch (e) {
      return null;
    }
  }
}

export = new TokenService();
