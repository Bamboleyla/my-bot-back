import middleware from "./error-middleware";

describe("error-middleware", () => {
  const json = jest.fn();
  const req = {};
  const res = {
    status: jest.fn().mockReturnValue({ json }),
  };
  const next = jest.fn();

  it("Если у ошибки присутсвует свойство type, тогда должен вернутся res.status(err.status).json({ message, errors })", () => {
    const err = {
      message: "Test error",
      status: 400,
      errors: ["error1", "error2"],
      type: "test",
    };

    middleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      message: "Test error",
      errors: ["error1", "error2"],
    });
  });

  it('Если у ошибки отсутствует свойство type, тогда должен вернутся res.status(500).json({ message: "Непредвиденная ошибка" })', () => {
    const err2 = { message: "Test error 2", status: 500 };

    middleware(err2, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      message: "Непредвиденная ошибка",
    });
  });
});
