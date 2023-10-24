//jshint esversion:6
require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const encrypt=require("mongoose-encryption");
mongoose.connect("mongodb://127.0.0.1:27017/usersDB");
console.log(process.env.API_KEY);
const app=express();
const port=3000;
const userSchema=new mongoose.Schema({
    email:String,
    password:String
});
const secret=process.env.SECRET;
userSchema.plugin(encrypt,{secret:secret,encryptedFields : ["password"]});//plugins are used for allowing pre-packaged capabilities to extend their functionality.In this case our userSchema is having encryption power
//mongoose will encrypt when we use save() and decrypts when we use find()
const User=mongoose.model("User",userSchema);
app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));
app.get("/",(req,res)=>{
    res.render("home");
});
app.get("/login",(req,res)=>{
    res.render("login");
});
app.get("/register",(req,res)=>{
    res.render("register");
});
app.post("/register",(req,res)=>{
    const newuser=new User({
        email:req.body.username,
        password:req.body.password
    });
    newuser.save().then((result)=>{
        console.log("Registered successfully");
        res.render("secrets");
    });
});
app.post("/login",(req,res)=>{
    const username=req.body.username;
    const pass=req.body.password;
    User.findOne({email:username}).then((result)=>{
        if(result.password==pass){
            console.log("logged in successfully");
            res.render("secrets")
        }
        else{
            console.log("incorrect password");
            res.render("login");
        }
    })
})
app.listen(port,()=>{
    console.log(`server started on the port ${port}`);
})

