const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");


router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.registerUser))

router.route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), wrapAsync(userController.loginUser))

//Logout
router.get("/logout", userController.logoutUser);


module.exports = router;