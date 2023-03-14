import db from "../../../config/db";
import { validateDbResponse } from "../../shared/validateDbResponse";

class TokenTGService {
  async checkTokenTG(token: string) {
    const result = await db.query(`SELECT * FROM users where tg_token=$1`, [
      token,
    ]);
    return Boolean(validateDbResponse(result));
  }
}

export = new TokenTGService();
