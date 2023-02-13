const authMiddleware = require("../middlewares/auth-middleware");
const Router = require("express");
const router = new Router();
const { body } = require("express-validator");

const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");

router.post("/checkEmail", authController.checkEmail);
router.post("/checkPhone", authController.checkPhone);
router.post("/checkTokenTG", authController.checkTokenTG);
router.post("/auth", authController.login);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/activate/:link", userController.activate);
router.get("/refresh", userController.refresh);
router.get("/users", authMiddleware, userController.getUsers);
router.post(
  "/registration",
  body("email").isEmail(),
  body("password").isLength({ min: 3, max: 32 }),
  userController.registration
);

export = router;
