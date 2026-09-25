const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getIO } = require("../utils/socket");


// ======================
// USER REGISTER
// ======================

const register = async (req,res)=>{

    try{


        const {
            name,
            email,
            password,
            contact
        } = req.body;

        const cleanContact = String(contact || "").trim();

        if(!name || !email || !password || !cleanContact){

            return res.status(400).json({

                message:"All fields are required"

            });

        }

        if(!/^\d{10}$/.test(cleanContact)){
            return res.status(400).json({
                message:"Phone number must be exactly 10 digits"
            });
        }



        const existUser = await User.findOne({
            email
        });



        if(existUser){

            return res.status(400).json({

                message:"User already exists"

            });

        }




        const hashedPassword =
        await bcrypt.hash(password,10);




        const user = await User.create({

            name,

            email,

            password:hashedPassword,

            contact: cleanContact,

            role:"user"

        });





        // Let admin dashboards know a new account was created,
        // without needing a page refresh.
        try {
            getIO().to("admins").emit("user:new", {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            });
        } catch (e) {
            console.warn("Socket emit skipped (user:new):", e.message);
        }

        res.status(201).json({

            message:"Registration Successful",

            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                contact:user.contact
            }

        });





    }catch(error){


        res.status(500).json({

            message:error.message

        });

    }

};







// ======================
// USER LOGIN
// ======================


const login = async(req,res)=>{


    try{


        const {
            email,
            password
        } = req.body;




        if(!email || !password){


            return res.status(400).json({

                message:"All fields are required"

            });

        }





        const user = await User.findOne({
            email
        });




        if(!user){


            return res.status(404).json({

                message:"User not found"

            });


        }







        const match =
        await bcrypt.compare(
            password,
            user.password
        );





        if(!match){


            return res.status(401).json({

                message:"Invalid password"

            });


        }






        const token = jwt.sign(
            {
                id:user._id,
                isAdmin:user.isAdmin
            },
            process.env.JWT_SECRET,


            {
                expiresIn:"1d"
            }

        );







        res.json({

            message:"Login successful",


            token,


            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                contact:user.contact,
                address:user.address,
                isAdmin:user.isAdmin
            }


        });





    }catch(error){


        res.status(500).json({

            message:error.message

        });

    }



};







// ======================
// GET PROFILE
// ======================


const getProfile = async(req,res)=>{


    try{


        const user = await User.findById(
            req.user.id
        )
        .select("-password");



        res.json(user);



    }catch(error){


        res.status(500).json({

            message:error.message

        });

    }

};

module.exports = {

    register,

    login,

    getProfile

};