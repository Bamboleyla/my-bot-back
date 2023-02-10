const jwt = require("jsonwebtoken");
const db = require("../../config/db");
const config = require("config");

class TokenService {
  generateTokens(payload) {
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

  validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, config.get("jwt-access-secret"));
      return userData;
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken(token) {
    try {
      const userData = jwt.verify(token, config.get("jwt-refresh-secret"));
      return userData;
    } catch (e) {
      return null;
    }
  }

  async saveToken(userId, refreshToken) {
    const tokenData = await db.query(`SELECT * FROM Tokens WHERE user_id=$1`, [
      userId,
    ]);
    if (tokenData.rows.length === 1)
      await db.query(`UPDATE Tokens SET token=$2 WHERE user_id=$1`, [
        userId,
        refreshToken,
      ]);
  }

  async removeToken(refreshToken) {
    const user = await db.query(`SELECT user_id FROM Tokens WHERE token=$1`, [
      refreshToken,
    ]);
    if (user.rows.length === 1)
      await db.query(`UPDATE Tokens SET token=${null} WHERE user_id=$1`, [
        user.rows[0].user_id,
      ]);
  }

  async findToken(refreshToken) {
    const tokenData = await tokenModel.findOne({ refreshToken });
    return tokenData;
  }
}

module.exports = new TokenService();
