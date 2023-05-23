import { Iresult, validateDbResponse } from "./validateDbResponse";

describe("validateDbResponse", () => {
  it("Если rows.length !== 1 должен вернуть false", () => {
    const result: Iresult = { rows: [] };
    expect(validateDbResponse(result)).toBe(false);

    const result2: Iresult = { rows: [{}, {}] };
    expect(validateDbResponse(result2)).toBe(false);
  });

  it("Если rows.length === 1 должен вернуть obj с индексом 1", () => {
    const result: Iresult = { rows: [{ id: 1, name: "John" }] };
    expect(validateDbResponse(result)).toEqual({ id: 1, name: "John" });
  });
});
