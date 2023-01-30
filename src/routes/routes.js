const Router = require("express");
const router = new Router();

const authController = require("../controllers/auth.controller");

router.post("/checkEmail", authController.checkEmail);
router.post("/checkPhone", authController.checkPhone);
router.post("/checkTokenTG", authController.checkTokenTG);
router.post("/auth", authController.login);
router.post("/logout", authController.logout); //TODO
router.get("/activate/:link", authController.activate); //TODO
router.get("/refresh", authController.refresh); //TODO
router.get("/users", /*  authMiddleware, */ authController.getUsers); //TODO
// router.post(
//   "/registration",
//   body("email").isEmail(),
//   body("password").isLength({ min: 3, max: 32 }),
//   authController.registration
// );

module.exports = router;
