const Router = require("express");
const router = new Router();
const authController = require("../controllers/auth.controller");

router.post("/auth", authController.checkLoginPassword);

module.exports = router;
