const User = require("../models/User");
const Food = require("../models/Food");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// Admin Login
exports.adminLogin = async (req,res)=>{

    try{

        const {email,password}=req.body;

        if(!email || !password){
            return res.status(400).json({
                message:"All fields are required"
            });
        }


        const admin = await User.findOne({
            email,
            role:"admin"
        });


        if(!admin){
            return res.status(404).json({
                message:"Admin not found"
            });
        }


        const match = await bcrypt.compare(
            password,
            admin.password
        );


        if(!match){
            return res.status(401).json({
                message:"Wrong password"
            });
        }


        const token = jwt.sign(
            {
                id:admin._id,
                role:"admin"
            },
            process.env.JWT_SECRET
        );


        res.json({
            message:"Login successful",
            token
        });


    }catch(err){

        res.status(500).json({
            message:err.message
        });

    }

};



// Get Users
exports.getUsers = async(req,res)=>{

    const users = await User.find()
    .select("-password");

    res.json(users);

};



// Add Food
exports.addFood = async(req,res)=>{

    try{

        const food = await Food.create({

            name:req.body.name,

            price:req.body.price,

            category:req.body.category,

            description:req.body.description,

            image:req.file 
            ? req.file.path 
            : ""

        });


        res.json({
            message:"Food added",
            food
        });


    }catch(err){

        res.status(500).json({
            message:err.message
        });

    }

};



// Get Foods
exports.getFoods = async(req,res)=>{

    const foods = await Food.find();

    res.json(foods);

};



// Delete Food
exports.deleteFood = async(req,res)=>{

    await Food.findByIdAndDelete(
        req.params.id
    );

    res.json({
        message:"Food deleted"
    });

};