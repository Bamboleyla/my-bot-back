import jwt from "jsonwebtoken";
import db from "../../config/db";
import config from "config";

class TokenService {
  generateTokens(payload): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(payload, config.get("jwt-access-secret"), {
      expiresIn: "30s",
    });
    const refreshToken = jwt.sign(payload, config.get("jwt-refresh-secret"), {
      expiresIn: "30d",
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  validateToken(
    token: string,
    type_token: "access" | "refresh"
  ): boolean | null {
    const secret = () => {
      switch (type_token) {
        case "access":
          return config.get("jwt-access-secret");
        case "refresh":
          return config.get("jwt-refresh-secret");
        default:
          console.error(`Для type_token = ${type_token} не определен сценарий`);
          break;
      }
    };

    try {
      const userData: boolean = jwt.verify(token, secret);
      return userData;
    } catch (e) {
      return null;
    }
  }

  async saveToken(userId: string, refreshToken: string) {
    const tokenData = await db.query(`SELECT * FROM Tokens WHERE user_id=$1`, [
      userId,
    ]);
    if (tokenData.rows.length === 1)
      await db.query(`UPDATE Tokens SET token=$2 WHERE user_id=$1`, [
        userId,
        refreshToken,
      ]);
  }

  async removeToken(refreshToken: string) {
    const user = await db.query(`SELECT user_id FROM Tokens WHERE token=$1`, [
      refreshToken,
    ]);
    if (user.rows.length === 1)
      await db.query(`UPDATE Tokens SET token=${null} WHERE user_id=$1`, [
        user.rows[0].user_id,
      ]);
  }
}

export = new TokenService();
