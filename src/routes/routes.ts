import express from "express";
import { body } from "express-validator";

import authController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth-middleware";
import forgetPasswordController from "../controllers/forgetPassword.controller";

const router = express.Router();

router.post("/checkEmail", authController.checkEmail);
router.post("/checkPhone", authController.checkPhone);
router.post("/checkTokenTG", authController.checkTokenTG);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/emailCode", authController.activate);
router.get("/refresh", authController.refresh);
router.get("/users", authMiddleware, authController.getUsers);
router.post(
  "/registration",
  body("email").isEmail(),
  body("password").isLength({ min: 3, max: 32 }),
  authController.registration
);

router.post("/sendCodeToEmail", forgetPasswordController.sendСodeToEmail);
router.post("/changePassword", forgetPasswordController.changePassword);

export = router;
