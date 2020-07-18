const User = require("../models/user");
const Product = require("../models/product")

const fs = require("fs");
const { validationResult } = require("express-validator");

exports.addNewProduct = (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error(errors.errors[0].msg)
        error.statusCode = 422;
        throw error;
    }
    const image = req.file;
    if(!image){
        const error = new Error("Please upload an image")
        error.statusCode = 422;
        throw error;
    }
    console.log("adding new product");

    console.log(image);

    const imageUrl = image.path;
    console.log(imageUrl);

    const product = new Product({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        imageUrl: imageUrl
    })

    product.save()
    .then(result=>{
        res.status(201).json({"message":"success"});
    })
    .catch(err=>{
        err.statusCode = err.statusCode || 500;
        next(err);
    })
    
}

exports.deleteProduct = (req,res,next)=>{
    console.log("deleting product");
    const prodId = req.params.prodId;
    if(!prodId) return;

    Product.findById(prodId)
    .then(product=>{
        if(!product){
            const error = new Error("No product found");
            error.statusCode = 404;
            throw error;
        }
        deleteFile(product.imageUrl);
        
        return Product.findByIdAndRemove(prodId);
    })
    .then(result=>{
        res.status(200).json({"message": "success"});
    })
    .catch(err=>{
        err.statusCode = err.statusCode || 500;
        next(err);
    })
}

exports.updateProduct = (req,res,next)=>{
    const prodId = req.params.prodId;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error(errors.errors[0].msg)
        error.statusCode = 422;
        throw error;
    }

    const image = req.file;

    Product.findById(prodId)
    .then(product=>{
        product.title = req.body.title;
        product.description = req.body.description;
        product.price = req.body.price;
        product.category = req.body.category;

        if(image){
            deleteFile(product.imageUrl);
            product.imageUrl = image.path;
        }

        return product.save();
    })
    .then(result=>{
        res.status(200).json({"message": "success"})
    })
    .catch(err=>{
        err.statusCode = err.statusCode || 500;
        next(err);
    })
}

function deleteFile(filepath){
    fs.unlink(filepath,(err)=>{
        if(err){
            throw err;
        }
    })
}