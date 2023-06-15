import { validationResult } from "express-validator";
import registrationService from "../service/registration";
import ApiError from "../exceptions/api-error";
import mailService from "../service/mail";
import phoneService from "../service/phone";
import tokenTGService from "../service/tokenTG";

/**
 * Класс в котором распологаются все операции при регистрации
 * @description Контроллер который включает в себя все операции с данными при регистрации, некоторые свойства могут использоваться и в других случаях,
 * например checkEmail, который проверяет- есть в БД пользователь с данным email или нет
 */
class RegistrationController {
  /**
   * Aсинхронный метод класса, которая регистрирует нового пользователя
   *
   * @description метод производит следующие операции:
   * Функция "registration" - это асинхронная функция, которая принимает три параметра: "req", "res" и "next" и возвращает Promise типа 'Response'.
   * Внутри функции есть блок "try-catch", который обрабатывает ошибки.
   * В блоке "try" есть проверка валидации ошибок через функцию validationResult, которая принимает параметр "req". Если есть ошибки, то возвращается ошибка типа ApiError.BadRequest.
   * Если ошибок нет, то происходит регистрация пользователя через сервис "registrationService". Возвращается токен и записывается в cookie.
   * В конечном итоге, функция возвращает ответ в виде JSON, если пользователь успешно зарегистрирован, иначе 200 false. Если во время выполнения возникла ошибка, она передается функции "next".
   */
  async registration(req, res, next): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(
          ApiError.BadRequest("Ошибка при валидации", errors.array())
        );
      }
      const token = await registrationService.registration(req.body);
      res.cookie("token", token, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.status(200).json(true); //TODO если пользователь уже зарегистирован -> 200 false
    } catch (e) {
      next(e);
    }
  }
  /**
   * Aсинхронный метод класса, которая изменяет статус пользователя на активированный
   *
   * @description Функция "activate" является асинхронной и принимает три параметра: "req", "res" и "next" и возвращает Promise типа 'Response'.
   * Функция извлекает значения "email" и "code" из тела запроса, затем вызывает метод "activate" из сервиса регистрации, который должен вернуть логическое значение "true" или "false".
   * Если значение "true", функция возвращает ответ со статусом 200 и JSON объектом с ключом "success" равным true, а также пустым сообщением.
   * Если значение "false", функция также возвращает ответ со статусом 200, но с JSON объектом, где ключ "success" равен false, а ключ "message" содержит сообщение "Неверный пароль".
   * Если возникает ошибка, функция перенаправляет её с помощью "next".
   */
  async activate(req, res, next): Promise<Response> {
    try {
      const { email, code } = req.body;
      const result = await registrationService.activate(email, code);
      if (result) return res.status(200).json({ success: true, message: "" });
      return res
        .status(200)
        .json({ success: false, message: "Неверный пароль" });
    } catch (e) {
      next(e);
    }
  }
  /**
   * Aсинхронный метод класса, которая проверяет существует ли email в БД
   *
   * @description Данный код представляет собой асинхронную функцию "checkEmail" с тремя параметрами: req, res и next и возвращает Promise типа 'Response'.
   * Функция принимает из объекта запроса параметр email, вызывает метод checkEmail из модуля mailService и обрабатывает результат.
   * Если успешно, возвращает результат в формате JSON и статус 200.
   * В случае ошибки вызывает middleware-функцию next с объектом ошибки в качестве параметра.
   */
  async checkEmail(req, res, next): Promise<Response> {
    try {
      const { email } = req.body;
      const result = await mailService.checkEmail(email);
      return res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }
  /**
   * Aсинхронный метод класса, которая проверяет существует ли номер телефона в БД
   *
   * @description Это асинхронная функция checkPhone, которая принимает три параметра: req, res и next и возвращает Promise типа 'Response'.
   * Функция извлекает значение параметра phone из объекта запроса, вызывает phoneService.checkPhone(phone) асинхронно, ожидая ответ,
   * после чего возвращает ответ с статусом 200 и json-данными на основе результата работы phoneService.checkPhone.
   * В случае ошибки вызывается функция next, передавая ей ошибку в качестве параметра.
   */
  async checkPhone(req, res, next): Promise<Response> {
    try {
      const { phone } = req.body;
      const result = await phoneService.checkPhone(phone);
      return res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }
  /**
   * Aсинхронный метод класса, которая проверяет существует ли Телеграмм токен в БД
   *
   * @description Функция "checkTokenTG" - асинхронная и принимает три параметра: req, res и next и возвращает Promise типа 'Response'.
   * Внутри функции используется блок try-catch для обработки ошибок.
   * В блоке try происходит деструктуризация объекта запроса(req) и извлечение свойства "token" из поля "body".
   * После этого происходит вызов функции "checkTokenTG" из сервиса "tokenTGService" с передачей ей "token".
   * Значение, возвращаемое функцией "checkTokenTG", передается обратно в ответ(Response) клиенту в формате JSON с кодом статуса HTTP 200.
   * Если возникнет ошибка в блоке try - вызывается функция next с передачей ей объекта ошибки(e).
   */
  async checkTokenTG(req, res, next): Promise<Response> {
    try {
      const { token } = req.body;
      const result = await tokenTGService.checkTokenTG(token);
      return res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }
}

export = new RegistrationController();
