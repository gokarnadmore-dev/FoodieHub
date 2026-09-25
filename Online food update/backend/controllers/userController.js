const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { getIO } = require("../utils/socket");


// ======================
// GET USER PROFILE
// ======================

exports.getProfile = async (req, res) => {

    try {

        const user = await User.findById(
            req.user.id
        )
        .select("-password");


        if (!user) {

            return res.status(404).json({

                message: "User not found"

            });

        }


        res.json(user);



    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};






// ======================
// UPDATE PROFILE
// ======================

exports.updateProfile = async (req, res) => {

    try {


        const {
            name,
            email,
            contact,
            phone,
            address
        } = req.body;



        const user = await User.findById(
            req.user.id
        );



        if (!user) {

            return res.status(404).json({

                message:"User not found"

            });

        }




        user.name =
        name || user.name;


        user.email =
        email || user.email;


        user.contact = contact || phone || user.contact;


        user.address =
        address || user.address;

        user.profileImage = req.body.profileImage || user.profileImage;



        await user.save();

        const updatedUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            contact: user.contact,
            address: user.address,
            profileImage: user.profileImage,
            isAdmin: user.isAdmin
        };

        try {
            const io = getIO();
            io.to(`user_${user._id}`).emit("user:updated", updatedUser);
            io.to("admins").emit("user:updated", updatedUser);
        } catch (socketErr) {
            console.warn("Socket emit skipped (user:updated):", socketErr.message);
        }




        res.json({

            message:"Profile updated",

            user: updatedUser

        });




    } catch(error) {


        res.status(500).json({

            message:error.message

        });

    }

};









// ======================
// CHANGE PASSWORD
// ======================

exports.changePassword = async(req,res)=>{


    try{


        const {
            oldPassword,
            newPassword
        } = req.body;




        const user =
        await User.findById(
            req.user.id
        );



        const match =
        await bcrypt.compare(
            oldPassword,
            user.password
        );



        if(!match){

            return res.status(400).json({

                message:"Old password incorrect"

            });

        }




        user.password =
        await bcrypt.hash(
            newPassword,
            10
        );




        await user.save();




        res.json({

            message:"Password changed successfully"

        });




    }catch(error){


        res.status(500).json({

            message:error.message

        });

    }

};









// ======================
// DELETE ACCOUNT
// ======================

exports.deleteAccount = async(req,res)=>{


    try{


        await User.findByIdAndDelete(
            req.user.id
        );


        res.json({

            message:"Account deleted"

        });



    }catch(error){


        res.status(500).json({

            message:error.message

        });

    }

};







// ======================
// GET ALL USERS (ADMIN)
// ======================

exports.getAllUsers = async(req,res)=>{


    try{


        const users =
        await User.find()
        .select("-password");



        res.json(users);



    }catch(error){


        res.status(500).json({

            message:error.message

        });
    }

};

exports.promoteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) return res.status(404).json({message: "User not found"});
        user.isAdmin = true;
        await user.save();

        try {
            getIO().to("admins").emit("user:updated", {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            });
        } catch (e) {
            console.warn("Socket emit skipped (user:updated):", e.message);
        }

        res.json({message: "User promoted"});
    } catch(err) {
        res.status(500).json({message: err.message});
    }
};

exports.deleteUserById = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);

        try {
            getIO().to("admins").emit("user:deleted", { _id: req.params.id });
        } catch (e) {
            console.warn("Socket emit skipped (user:deleted):", e.message);
        }

        res.json({message: "User deleted"});
    } catch(err) {
        res.status(500).json({message: err.message});
    }
};