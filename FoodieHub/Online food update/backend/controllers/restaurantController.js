const Restaurant = require("../models/Restaurant");


// ======================
// ADD RESTAURANT
// ======================

exports.addRestaurant = async (req, res) => {

    try {


        const {
            name,
            address,
            phone,
            category,
            description
        } = req.body;



        if (!name || !address) {

            return res.status(400).json({

                message: "Restaurant name and address required"

            });

        }




        const restaurant = await Restaurant.create({

            name,

            address,

            phone,

            category,

            description,

            image: req.file
            ? req.file.path
            : ""

        });





        res.status(201).json({

            message: "Restaurant added successfully",

            restaurant

        });





    } catch (error) {


        res.status(500).json({

            message: error.message

        });

    }

};







// ======================
// GET ALL RESTAURANTS
// ======================

exports.getRestaurants = async (req, res) => {


    try {


        const restaurants =
        await Restaurant.find();



        res.json(restaurants);



    } catch (error) {


        res.status(500).json({

            message:error.message

        });

    }

};








// ======================
// GET SINGLE RESTAURANT
// ======================

exports.getRestaurantById = async (req,res)=>{


    try{


        const restaurant =
        await Restaurant.findById(
            req.params.id
        );



        if(!restaurant){


            return res.status(404).json({

                message:"Restaurant not found"

            });

        }



        res.json(restaurant);



    }catch(error){


        res.status(500).json({

            message:error.message

        });

    }

};








// ======================
// UPDATE RESTAURANT
// ======================

exports.updateRestaurant = async(req,res)=>{


    try{


        const restaurant =
        await Restaurant.findById(
            req.params.id
        );



        if(!restaurant){

            return res.status(404).json({

                message:"Restaurant not found"

            });

        }



        restaurant.name =
        req.body.name || restaurant.name;


        restaurant.address =
        req.body.address || restaurant.address;


        restaurant.phone =
        req.body.phone || restaurant.phone;


        restaurant.category =
        req.body.category || restaurant.category;


        restaurant.description =
        req.body.description || restaurant.description;




        if(req.file){

            restaurant.image =
            req.file.path;

        }




        await restaurant.save();




        res.json({

            message:"Restaurant updated",

            restaurant

        });




    }catch(error){


        res.status(500).json({

            message:error.message

        });

    }

};








// ======================
// DELETE RESTAURANT
// ======================

exports.deleteRestaurant = async(req,res)=>{


    try{


        const restaurant =
        await Restaurant.findByIdAndDelete(
            req.params.id
        );



        if(!restaurant){

            return res.status(404).json({

                message:"Restaurant not found"

            });

        }




        res.json({

            message:"Restaurant deleted"

        });




    }catch(error){


        res.status(500).json({

            message:error.message

        });

    }

};







// ======================
// SEARCH RESTAURANT
// ======================

exports.searchRestaurant = async(req,res)=>{


    try{


        const keyword =
        req.query.name;



        const restaurants =
        await Restaurant.find({

            name:{
                $regex:keyword,
                $options:"i"
            }

        });




        res.json(restaurants);



    }catch(error){


        res.status(500).json({

            message:error.message

        });

    }

};