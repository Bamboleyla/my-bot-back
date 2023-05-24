import PhoneService from ".";
import db from "../../../config/db";
import { validateDbResponse } from "../../shared/validateDbResponse";

describe("PhoneService", () => {
  describe("checkPhone", () => {
    it(`Предположим у нас уже есть пользователь с телефоном 7 (123) 456 7890, тогда при checkPhone(phone: '7 (123) 456 7890') должен произойти вызов:
  db.query(SELECT * FROM users where phone=$1, [+71234567890]) и вернуть true
)`, async () => {
      const result = {
        rows: [
          {
            id: 1,
            user: "Test",
          },
        ],
      };
      jest.spyOn(db, "query").mockResolvedValue(result);

      expect(await PhoneService.checkPhone("7 (123) 456 7890")).toBeTruthy();
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM users where phone=$1",
        ["+71234567890"]
      );
    });
    it(`Предположим у нас нет пользователь с тедлефоном 7 (123) 456 7890, тогда при checkPhone(phone: '7 (123) 456 7890') должен произойти вызов:
  db.query(SELECT * FROM users where phone=$1, [+71234567890]) и вернуть false
)`, async () => {
      jest.spyOn(db, "query").mockResolvedValue({
        rows: [],
      });

      expect(await PhoneService.checkPhone("7 (123) 456 7890")).toBeFalsy();
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM users where phone=$1",
        ["+71234567890"]
      );
    });
  });
});
