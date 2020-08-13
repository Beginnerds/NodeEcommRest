const path = require("path");
const fs = require("fs");

const authController = require("../controllers/authController");

// Add a file named adminUser.json in the current directory with appropriate json data to create first admin use

exports.configUser = function(){
    const filePath = path.join(__dirname,'adminUser.json');
    
    try{
        let file = fs.readFileSync(filePath,{
            encoding: "utf-8",
        });

        console.log("**********FILE**********\n" + file);

        if(file){
            let adminUser = JSON.parse(file);
            fs.unlinkSync(filePath,(err =>{
                throw err;
            }));
            console.log(adminUser);

            let req = {};
            req.body = {...adminUser};

            authController.signUp(req);
        }
        
    }
    catch(error){
        console.log(error);
        if(error.code === "ENOENT"){
            return;
        }

        throw error;
    }
}