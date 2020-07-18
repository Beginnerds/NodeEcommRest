const express = require("express");
const router = express.Router();
const { body } = require("express-validator")

const authController = require("../controllers/authController");


router.post('/signup',
[
    body('firstName')
    .trim()
    .isLength({min:2})
    .withMessage("First name should be at least 2 characters long."),

    body('lastName')
    .trim()
    .isLength({min:2})
    .withMessage("Last name should be at least 2 characters long."),

    body('email')
    .trim()
    .isEmail()
    .withMessage("Invalid email address"),

    body('password')
    .trim()
    .isLength({min:8})
    .withMessage("Password should be at least 8 characters long."),
],
authController.signUp);

router.post('/login',
[
    body('email')
    .trim()
    .isEmail()
    .withMessage("Invalid email address")
],
authController.logIn);

router.post('/reset',
[
    body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email")
],
authController.reset)

router.post('/update-password/:resetToken',
[
    body('password')
    .trim()
    .isLength(6)
    .withMessage("password must be at least 6 characters long"),
],
authController.updatePassword);

router.get('/check-role',authController.checkUserRole);

module.exports = router;