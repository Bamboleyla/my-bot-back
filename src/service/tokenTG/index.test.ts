import db from "../../../config/db";
import TokenTGService from ".";

describe("TokenTGService", () => {
  describe("checkTokenTG", () => {
    const token = "t0k3n";
    it(`При вызове checkTokenTG(token) если пользователь с tg_token был найден, должен произойти вызов
        db.query(SELECT * FROM users where tg_token=$1, [ token ])
        и вернутся true`, async () => {
      jest.spyOn(db, "query").mockResolvedValue({
        rows: [{}],
      });
      expect(await TokenTGService.checkTokenTG(token)).toBeTruthy();
      expect(db.query).toBeCalledWith("SELECT * FROM users where tg_token=$1", [
        token,
      ]);
    });

    it(`При вызове checkTokenTG(token) если пользователь с tg_token небыл найден, должен произойти вызов
        db.query(SELECT * FROM users where tg_token=$1, [ token ])
        и вернутся false`, async () => {
      jest.spyOn(db, "query").mockResolvedValue({
        rows: [],
      });
      expect(await TokenTGService.checkTokenTG(token)).toBeFalsy();
      expect(db.query).toBeCalledWith("SELECT * FROM users where tg_token=$1", [
        token,
      ]);
    });
  });
});
