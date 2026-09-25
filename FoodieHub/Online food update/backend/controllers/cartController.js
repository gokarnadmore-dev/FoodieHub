const Cart = require("../models/Cart");
const Food = require("../models/Food");
const { getIO } = require("../utils/socket");

function emitCartUpdated(userId, cart) {
    try {
        getIO().to(`user_${userId}`).emit("cart:updated", cart || { items: [] });
    } catch (error) {
        console.warn("Socket emit skipped (cart:updated):", error.message);
    }
}


// ADD TO CART
exports.addToCart = async (req, res) => {

    try {

        const { foodId, quantity } = req.body;


        if (!foodId || !quantity) {

            return res.status(400).json({
                message: "Food and quantity required"
            });

        }


        const food = await Food.findById(foodId);


        if (!food) {

            return res.status(404).json({
                message: "Food not found"
            });

        }



        let cart = await Cart.findOne({
            user: req.user.id
        });



        if (!cart) {

            cart = new Cart({

                user: req.user.id,

                items: []

            });

        }



        // Check if item already exists by product field
        const existing = cart.items.find(
            i => i.product.toString() === foodId
        );



        if (existing) {

            existing.quantity += Number(quantity);
            existing.total = existing.price * existing.quantity;

        } else {

            cart.items.push({
                product: foodId,
                name: food.name,
                image: food.image || "",
                price: food.price,
                quantity: Number(quantity),
                total: food.price * Number(quantity)
            });

        }



        await cart.save();

        emitCartUpdated(req.user.id, cart);



        res.json({

            message: "Added to cart",

            cart

        });



    } catch (error) {


        res.status(500).json({

            message: error.message

        });

    }

};






// GET CART

exports.getCart = async (req,res)=>{


    try{


        const cart = await Cart.findOne({

            user:req.user.id

        })
        .populate("items.product");



        res.json(cart || {items:[]});



    }catch(error){


        res.status(500).json({

            message:error.message

        });

    }

};







// UPDATE CART ITEM
exports.updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const item = cart.items.find(i => i.product.toString() === req.params.id);
        if (!item) return res.status(404).json({ message: "Item not in cart" });

        item.quantity = Number(quantity);
        item.total = item.price * item.quantity;
        await cart.save();

        emitCartUpdated(req.user.id, cart);

        res.json({ message: "Cart updated", cart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// REMOVE ITEM
exports.removeCartItem = async(req,res)=>{
    try{
        const cart = await Cart.findOne({ user:req.user.id });
        cart.items = cart.items.filter(
            item => item.product.toString() !== req.params.id
        );
        await cart.save();
        emitCartUpdated(req.user.id, cart);
        res.json({ message:"Item removed", cart });
    }catch(error){
        res.status(500).json({ message:error.message });
    }
};







// CLEAR CART

exports.clearCart = async(req,res)=>{


    try{


        await Cart.findOneAndDelete({

            user:req.user.id

        });

        emitCartUpdated(req.user.id, { items: [] });



        res.json({

            message:"Cart cleared"

        });



    }catch(error){


        res.status(500).json({

            message:error.message

        });

    }

};