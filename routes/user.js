const router = require("express").Router();

const userController = require("../controllers/userController");

router.post('/add-cart/:prodId',userController.addToCart);

router.delete('/delete-cart/:prodId',userController.deleteFromCart);

router.get('/cart',userController.getCart);

module.exports = router;