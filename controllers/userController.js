const User = require("../models/user");
const Product = require("../models/product");
const user = require("../models/user");

exports.addToCart = (req,res,next) =>{
    prodId = req.params.prodId;
    if(!prodId){
        const error = new Error("No product id specified")
        error.statusCode = 400;
        throw error;
    }

    Product.findById(prodId)
    .then(product =>{
        let newQuantity;

        const index = req.user.cart.items.findIndex((item)=>{
            return prodId === item.productId.toString();
        })

        if(index !== -1){ // Product already in cart, only update quantity
            newQuantity = req.user.cart.items[index].quantity + 1;

            req.user.cart.items.map((item)=>{
                if(item.productId.toString() === prodId){
                    item.quantity = newQuantity;
                }
                return item;
            })
        }

        else{ // product not in cart, add it
            newQuantity = 1;
            req.user.cart.items.push({
                productId: prodId,
                quantity: newQuantity
            });
        }

        return req.user.save();

    })
    .then(result=>{
        res.status(200).json({"message":"success"});
    })
    .catch(err=>{
        err.statusCode = err.statusCode || 500;
        next(err);
    })
}

exports.deleteFromCart = (req,res,next) =>{
    const prodId = req.params.prodId;
    let newCart = [];

    newCart = req.user.cart.items.filter(item =>{
        return item.productId.toString() !== prodId;
    })
    
    req.user.cart.items = newCart;
    
    req.user.save()
    .then(result=>{
        res.status(200).json({
            "message": "success"
        })
    })
    
}

exports.getCart = (req,res,next) =>{
    let cartItems = [];
    let promiseJobs = []

    for (const item of req.user.cart.items) {
        promiseJobs.push(new Promise((resolve,reject)=>{
            Product.findById(item.productId)
            .then(product =>{
                if(!product){
                    const error = new Error("No product found with the given id");
                    error.statusCode = 404;
                    throw error;
                }
                let newItem = {
                    id: product.get('_id'),
                    title: product.get('title'),
                    description:product.get('description'),
                    price: product.get('price'),
                    category: product.get('category'),
                    imageUrl: product.get('imageUrl'),
                    quantity: item.quantity
                }
                resolve(newItem);
            })
            .catch(error=>{
                error.statusCode = error.statusCode || 500;
                reject(error);
            });
        }));
    }

    Promise.all(promiseJobs)
    .then(result=>{
        cartItems = result;
        res.status(200).json({
            "message": "success",
            "cart": cartItems
        })
    })
    .catch(err=>{
        err.statusCode = err.statusCode || 500;
        next(err);
    })
}