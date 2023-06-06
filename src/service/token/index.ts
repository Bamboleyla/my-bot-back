import jwt from "jsonwebtoken";
import config from "config";
import { IvalidateToken } from "./models";

class TokenService {
  generateTokens(payload: { id: number }): string {
    return jwt.sign(payload, config.get("jwt-access-secret"), {
      expiresIn: "7d",
    });
  }

  validateToken(token: string): IvalidateToken | null {
    try {
      return jwt.verify(token, config.get("jwt-access-secret"));
    } catch (e) {
      return null;
    }
  }
}

export = new TokenService();
