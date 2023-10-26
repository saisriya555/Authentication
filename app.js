//jshint esversion:6
require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const path=require("path");
const session = require('express-session');
//for documentation visit passportjs.com
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose")
const app=express();
const port=3000;
app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));
//order of using the pacakages code is really important while implenting the cookies
//firstly initializing the session
app.use(session({
    secret:"This is my secret",
    resave:false,
    saveUninitialized:false

}));
//secondly using the passport
app.use(passport.initialize())//method for initializing the passport
app.use(passport.session())//using the passport for dealing with the sessions
mongoose.connect("mongodb://127.0.0.1:27017/usersDB");
const userSchema=new mongoose.Schema({
    email:String,
    password:String
});
//thirdly using passport-local-mongoose
userSchema.plugin(passportLocalMongoose);//in order to use plugins we have to create new mongooseschema instead of creating schema with a simple JSobject
//passportLocalMongoose is used to hash and salt the passwords and save the users to the mongoDB database

const User=mongoose.model("User",userSchema);
//next using passport-local which is a part of passport-local-mongoose
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());//creating the stuff inside the cookie like creating and storing the identification of the users
passport.deserializeUser(User.deserializeUser());//crashing or crumbling the cookie and finaaly doesnot know who the user is

app.get("/",(req,res)=>{
    res.render("home");
});
app.get("/login",(req,res)=>{
    res.render("login");
});
app.get("/register",(req,res)=>{
    res.render("register");
});
app.get("/secrets",(req,res)=>{
    //when the user registers and if he is authenticated to the secrets page directly even if he is in any other site
    if(req.isAuthenticated()){
        res.render(__dirname+"/views/secrets");
    }else{
        res.render(__dirname+"/views/login");
    }
});
app.get("/logout",(req,res)=>{
    //logout() is a function in the passport package which is used to deauthenticate the user
    req.logout(function(err){
        if(err){
            console.log(err);
            res.redirect("/login")
        }
        else{
            console.log('Logged out succesfully');
            res.redirect("/");
        }
    });
});
//NOTE:when we try to update the code or when we restarted our server our cookie gets deleted
app.post("/register",(req,res)=>{
    User.register({username:req.body.username},req.body.password).then(()=>{
        //authenticate method from passportlocalmongoose is implemented to authenticate
        passport.authenticate("local")(req,res,function(){
            console.log("You are registered succesfully");
            res.redirect("/secrets");
        });
    });
});
app.post("/login",(req,res)=>{
    const user=new User({
        username:req.body.username,
        password:req.body.password
    });
    //login method is from the passport package
    req.login(user,function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                console.log("You are logged in succesfully");
                res.redirect("/secrets");
            });
        }
    })
})
app.listen(port,()=>{
    console.log(`server started on the port ${port}`);
})

