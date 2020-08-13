const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const {body} = require("express-validator");

router.post("/add-product",
    [
        body('title')
        .trim()
        .isLength({min:2})
        .withMessage("Title should be at least 3 characters long."),

        body('description')
        .trim()
        .isLength({min:10})
        .withMessage("Description should be at least 10 characters long."),

        body('price')
        .trim()
        .isLength({min:1})
        .withMessage("You must specify a price."),

        body('category')
        .trim()
        .isLength({min:1})
        .withMessage("You must specify a category."),
    ],
    adminController.addNewProduct);

router.delete("/product/:prodId",adminController.deleteProduct);

router.put("/update-product/:prodId",
[
    body('title')
    .trim()
    .isLength({min:2})
    .withMessage("Title should be at least 3 characters long."),

    body('description')
    .trim()
    .isLength({min:10})
    .withMessage("Description should be at least 10 characters long."),

    body('price')
    .trim()
    .isLength({min:1})
    .withMessage("You must specify a price."),

    body('category')
    .trim()
    .isLength({min:1})
    .withMessage("You must specify a category."),
],
adminController.updateProduct)

module.exports = router;