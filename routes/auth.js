const express = require("express");
const router= express.Router();
const User=require('../models/User');
const { query, validationResult } = require('express-validator');
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var fetchuser = require("../middleware/fetchuser");
let JWT_token='hariaibkasdnf';
// CREATEUSER
let success=false;
router.post("/createuser",[
    query('name').isLength({min:3}),
    query('password').isLength({min:5}),
    query('email').isEmail()
], async (req, res)=>{
    const errors=validationResult(req);
    success=false;
    if(errors.isEmpty()){
        return res.status(400).json({errors:errors.array});
    }
    try{
    let user= await User.findOne({email:req.body.email});
    if(user){
        return res.status(400).json({error:"sorry data already exist for this email"})
    }
    const salt=await bcrypt.genSalt(10);
    const pasw= await bcrypt.hash(req.body.password,salt);
     user= await User.create({
        name:req.body.name,
        password:pasw,
        email:req.body.email
    })
    // .then(user=>res.json(user)).catch(err=> console.log(err));
    const data={
        user:{
            id:user.id,
        }
    }
    const authtoken=jwt.sign(data,JWT_token)
    // console.log(authtoken);
    success=true;
    res.json({success:success,authtoken:authtoken});
}catch(error){
    console.error(error.message);
    res.status(500).send("some error occured");
}
})
// LOGIN
router.post("/login",[
    query('password').exists(),
    query('email').isEmail()
], async (req, res)=>{
    const errors=validationResult(req);
    if(errors.isEmpty()){
        return res.status(400).json({errors:errors.array});
    }
    const {email,password} = req.body;
    try{
    let user= await User.findOne({email});
    if(!user){
        return res.status(404).json({error:"please try to login with valid credentials"})
    }
    const pass=await bcrypt.compare(password,user.password);
    if(!pass){
        return res.status(404).json({error:"please try to login with valid credentials"})
    }
    const data={
        user:{
            id:user.id,
        }
    }
    const authtoken=jwt.sign(data,JWT_token)
    // console.log(authtoken);
    success=true;
    res.json({success,authtoken});

    }catch(error){
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})
router.post("/getuser",fetchuser, async (req, res)=>{
    try {
        let userid=req.user.id;
        const user= await User.findById(userid).select("-password");
        res.send(user)
    }catch(error){
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})
module.exports = router