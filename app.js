const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const path = require("path");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");
const shopRoutes = require("./routes/shop");

const isAuth = require("./middlewares/is-auth");

const configUser = require("./util/configUser");

const app = express();

app.use(cors());

app.use(express.json());

app.use(helmet());
app.use(compression());

const storage = multer.diskStorage({
  destination: (req,file,cb) =>{
    cb(null,"./images")
  },
  filename: (req,file,cb) =>{
    cb(null,Date.now() + '-' + file.originalname)
  }
})

const fileFilter = (req,file,cb) =>{
  if(file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg"){
    cb(null,true)
  }
  else{
    cb(new Error("Unsupported file type"));
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
})

app.use('/images',express.static(path.join(__dirname,'images')));
app.use('/auth',authRoutes);
app.use('/admin',isAuth.isLoggedIn,isAuth.isAdmin,upload.single("image"),adminRoutes);
app.use(shopRoutes);
app.use('/user',isAuth.isLoggedIn,userRoutes);
app.use((req,res)=>{
  res.status(404).json({
    "message": 'not found'
  })
})

app.use((error,req,res,next)=>{
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message});
})

mongoose.connect(`mongodb+srv://Owner:${process.env.DATABASE_PASSWORD}@cluster0.uluzd.mongodb.net/EcommMatNODE?retryWrites=true&w=majority`,{useNewUrlParser:true,useUnifiedTopology:true})
.then(result=>{
    console.log("connected to db");
    app.listen(process.env.PORT || 3000,()=>console.log(`server started on port ${process.env.PORT}`));
    configUser.configUser();
})
.catch(err=>{
    console.log("failed to connect to database");
    console.log(err);
})