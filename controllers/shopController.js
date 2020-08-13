const Product = require("../models/product");

exports.getProducts = (req,res,next) =>{
    const perPage = 10;
    let page = req.query.page || 1;
    let category = req.params.category;
    let totalItems;

    let query;

    console.log(category);

    if(category){
        query = Product.find()
        .countDocuments()
        .then(count =>{
            totalItems = count;
            return Product.find({
                "category": category
            })
            .skip(--page*perPage)
            .limit(perPage)
        })
    }

    else{
        query = Product.find()
        .countDocuments()
        .then(count =>{
            totalItems = count;
            return Product.find()
            .skip(--page*perPage)
            .limit(perPage)
        })
    }

    query
    .then(products =>{
        if(!products){
            const error = new Error("No products found");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            "message": "success",
            "totalItems": totalItems,
            "products": products
        })
    })
    .catch(error =>{
        error.statusCode = error.statusCode || 500;
        next(error);
    })
}

exports.getProduct = (req,res,next) =>{
    const prodId = req.params.prodId;

    Product.findById(prodId)
    .then(product =>{
        if(!product){
        const error = new Error("Product not found");
        error.statusCode = 404;
        throw error;
        }
        res.status(200).json({
            "message": "success",
            "product": product
        })
    })
    .catch(error =>{
        error.statusCode = error.statusCode || 500;
        next(error);
    })
}