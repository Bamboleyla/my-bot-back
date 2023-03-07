export = class ApiError extends Error {
  status;
  errors;
  type = "";

  constructor(status, type, message, errors = []) {
    super(message);
    this.status = status;
    this.type = type;
    this.errors = errors;
  }

  static UnauthorizedError() {
    return new ApiError(
      401,
      "UnauthorizedError",
      "Пользователь не авторизован"
    );
  }

  static BadRequest(message, errors = []) {
    return new ApiError(400, "BadRequest", message, errors);
  }
};
