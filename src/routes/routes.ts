import express from "express";
import { body } from "express-validator";

// CONTROLLERS
import authController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth-middleware";
import forgetPasswordController from "../controllers/forgetPassword.controller";
import registrationController from "../controllers/registration.controller";

const router = express.Router();

// AUTH
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/users", authMiddleware, authController.getUsers);

// REGISTRATION
router.post("/emailCode", registrationController.activate);
router.post("/checkEmail", registrationController.checkEmail);
router.post("/checkPhone", registrationController.checkPhone);
router.post("/checkTokenTG", registrationController.checkTokenTG);
router.post(
  "/registration",
  body("email").isEmail(),
  body("password").isLength({ min: 3, max: 32 }),
  registrationController.registration
);

// FORGET PASSWORD
router.post("/sendCodeToEmail", forgetPasswordController.sendСodeToEmail);
router.post("/changePassword", forgetPasswordController.changePassword);

export = router;
