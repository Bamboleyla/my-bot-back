const db = require("../../config/db");

let now = () => new Date().toLocaleTimeString();

class AuthController {
  async checkLoginPassword(req, res) {
    console.log(
      ` ${now()} поступил запрос на проверку авторизацию пользователя пользователя`
    );
    try {
      const { login, password } = req.body;
      const user = await db.query(
        `SELECT * FROM users where UserLogin=$1 and UserPassword=$2`,
        [login, password]
      );
      if (user.rows.length === 1) {
        console.log(` ${now()} пользователь найден ${user.rows[0].username}`);

        return res
          .status(200)
          .json({ id: user.rows[0].id, name: user.rows[0].username });
      }
    } catch (e) {
      console.log(
        `${now()} пользователь c login:${login} и password:${password} ненайден`
      );
      return res.status(404).json({ msg: "Authorization error" });
    }
  }
}

module.exports = new AuthController();
