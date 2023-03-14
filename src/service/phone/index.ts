import db from "../../../config/db";
import { validateDbResponse } from "../../shared/validateDbResponse";

class PhoneService {
  async checkPhone(phone: string) {
    const result = await db.query(`SELECT * FROM users where phone=$1`, [
      `+${phone.match(/\d/g).join("")}`,
    ]);
    return Boolean(validateDbResponse(result));
  }
}

export = new PhoneService();
