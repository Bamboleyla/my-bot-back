const db = require("../../config/db");

class AuthController {
  async checkEmail(req, res) {
    try {
      const { email } = req.body;
      const user = await db.query(`SELECT * FROM users where email=$1`, [
        email,
      ]);
      switch (user.rows.length) {
        case 1:
          return res.status(200).json({
            success: false,
            message: "данный email уже зарегистрирован",
          });
        case 0:
          return res
            .status(200)
            .json({ success: true, message: "данный email не занят" });
        default:
          console.error(
            `Для user.rows.length с значением: ${user.rows.length} сценарий не определен`
          );
          break;
      }
    } catch (error) {
      console.error(error);
    }
  }

  async checkPhone(req, res, next) {
    try {
      const { phone } = req.body;
      const user = await db.query(`SELECT * FROM users where phone=$1`, [
        `+${phone.match(/\d/g).join("")}`,
      ]);
      switch (user.rows.length) {
        case 1:
          return res.status(200).json({
            success: false,
            message: "данный номер телефона уже зарегистрирован",
          });

        case 0:
          return res
            .status(200)
            .json({ success: true, message: "данный phone number не занят" });
        default:
          console.error(
            `Для user.rows.length с значением: ${user.rows.length} сценарий не определен`
          );
          break;
      }
    } catch (error) {
      console.error(error);
    }
  }

  async checkTokenTG(req, res, next) {
    try {
      const { token } = req.body;
      const user = await db.query(`SELECT * FROM users where tg_token=$1`, [
        token,
      ]);
      switch (user.rows.length) {
        case 1:
          return res.status(200).json({
            success: false,
            message: "данный telegram token уже зарегистрирован",
          });
        case 0:
          return res
            .status(200)
            .json({ success: true, message: "данный telegram token не занят" });
        default:
          console.error(
            `Для user.rows.length с значением: ${user.rows.length} сценарий не определен`
          );
          break;
      }
    } catch (error) {
      console.error(error);
    }
  }
  async login(req, res) {
    try {
      const { login, password } = req.body;
      const user = await db.query(
        `SELECT * FROM users where user_login=$1 and user_password=$2`,
        [login, password]
      );
      if (user.rows.length === 1)
        return res
          .status(200)
          .json({ id: user.rows[0].id, name: user.rows[0].username });
    } catch (e) {
      return res.status(404).json({ msg: "Authorization error" });
    }
  }
  async logout(req, res, next) {
    try {
    } catch (error) {}
  }
  async activate(req, res, next) {
    try {
    } catch (error) {}
  }
  async refresh(req, res, next) {
    try {
    } catch (error) {}
  }
  async registration(req, res, next) {
    try {
    } catch (error) {}
  }
  async getUsers(req, res, next) {
    try {
      res.json(["123", "456"]);
    } catch (error) {}
  }
}

module.exports = new AuthController();
