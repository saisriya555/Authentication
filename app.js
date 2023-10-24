//jshint esversion:6
require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const saltRounds=10;
mongoose.connect("mongodb://127.0.0.1:27017/usersDB");
const app=express();
const port=3000;
const userSchema=new mongoose.Schema({
    email:String,
    password:String
});

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
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        const newuser=new User({
            email:req.body.username,
            password:hash
        });
        newuser.save().then((result)=>{
            console.log("Registered successfully");
            res.render("secrets");
        });
    });
});
app.post("/login",(req,res)=>{
    const username=req.body.username;
    const pass=req.body.password;
    User.findOne({email:username}).then((result)=>{
        bcrypt.compare(pass,result.password, function(err, result) {
            // result == true
            if(result==true){
                console.log("logged in successfully");
                res.render("secrets")  
            }
            else{
                console.log("incorrect password");
                res.render("login");
            }
        });
    })
})
app.listen(port,()=>{
    console.log(`server started on the port ${port}`);
})

