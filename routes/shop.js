const router = require("express").Router();

const shopController = require("../controllers/shopController");

router.get('/shop',shopController.getProducts);

router.get('/shop/:category',shopController.getProducts)

router.get("/shop/product/:prodId",shopController.getProduct);

module.exports = router;