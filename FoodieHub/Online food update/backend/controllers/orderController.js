const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");
const { getIO } = require("../utils/socket");


// ======================
// CREATE ORDER
// ======================

exports.createOrder = async (req, res) => {

    try {

        const { address, city, pincode, name, phone, paymentMethod, paymentReference } = req.body;

        if (!address) {
            return res.status(400).json({ message: "Address is required" });
        }

        const cart = await Cart.findOne({
            user: req.user.id
        }).populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        let totalAmount = 0;

        const items = cart.items.map(item => {
            const lineTotal = item.total || (item.price * item.quantity);
            totalAmount += lineTotal;

            return {
                product: item.product._id || item.product,
                name: item.name || item.product?.name || "Item",
                price: item.price,
                quantity: item.quantity
            };
        });

        const allowedPaymentMethods = ["COD", "UPI", "CARD", "NETBANKING", "WALLET"];
        const normalizedPaymentMethod = allowedPaymentMethods.includes(paymentMethod)
            ? paymentMethod
            : "COD";

        const order = await Order.create({
            user: req.user.id,
            items,
            totalAmount,
            shippingAddress: {
                name: name || "",
                phone: phone || "",
                address: address,
                city: city || "",
                pincode: pincode || ""
            },
            paymentMethod: normalizedPaymentMethod,
            paymentReference: String(paymentReference || "").trim(),
            // Online payments stay pending until the payment provider verifies them.
            paymentStatus: "Pending",
            orderStatus: "Placed"
        });

        // Clear cart after order
        await Cart.findOneAndDelete({ user: req.user.id });

        // Notify admin dashboards in real time so new orders appear
        // instantly without a page refresh.
        try {
            const io = getIO();
            io.to("admins").emit("order:new", order);
            io.to(`user_${req.user.id}`).emit("cart:updated", { items: [] });
            io.to(`user_${req.user.id}`).emit("order:new", order);
        } catch (e) {
            console.warn("Socket emit skipped (order:new):", e.message);
        }

        res.status(201).json({
            message: "Order placed successfully",
            order
        });

    } catch(error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// ======================
// GET SINGLE ORDER
// ======================

exports.getSingleOrder = async (req, res) => {

    try {

        const order = await Order.findById(req.params.id)
            .populate("user", "name email")
            .populate("items.product");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Only allow the owner or admin to view
        if (order.user._id.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.json(order);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};








// ======================
// GET MY ORDERS
// ======================


exports.getMyOrders = async(req,res)=>{


    try{


        const orders = await Order.find({

            user:req.user.id

        })
        .populate("items.product")
        .sort({
            createdAt:-1
        });




        res.json(orders);



    }catch(error){


        res.status(500).json({

            message:error.message

        });

    }

};








// ======================
// GET ALL ORDERS (ADMIN)
// ======================


exports.getAllOrders = async(req,res)=>{


    try{


        const orders = await Order.find()

        .populate("user","name email")

        .populate("items.product")

        .sort({
            createdAt:-1
        });




        res.json(orders);



    }catch(error){


        res.status(500).json({

            message:error.message

        });

    }

};







// ======================
// UPDATE ORDER STATUS
// ======================


exports.updateOrderStatus = async(req,res)=>{


    try{


        const {
            status
        } = req.body;



        const order =
        await Order.findById(
            req.params.id
        );




        if(!order){


            return res.status(404).json({

                message:"Order not found"

            });

        }





        order.orderStatus = status;


        await order.save();

        // Push the update live: the customer sees their tracker move
        // without refreshing, and other admin dashboards stay in sync.
        try {
            const io = getIO();
            io.to(`user_${order.user}`).emit("order:status", order);
            io.to("admins").emit("order:status", order);
        } catch (e) {
            console.warn("Socket emit skipped (order:status):", e.message);
        }





        res.json({

            message:"Order status updated",

            order

        });





    }catch(error){


        res.status(500).json({

            message:error.message

        });

    }

};








// ======================
// CANCEL ORDER
// ======================


exports.cancelOrder = async(req,res)=>{


    try{


        const order =
        await Order.findById(
            req.params.id
        );



        if(!order){

            return res.status(404).json({

                message:"Order not found"

            });

        }




        order.orderStatus = "Cancelled";


        await order.save();

        // Real-time: let the customer's tracker and any admin
        // dashboards know this order was cancelled.
        try {
            const io = getIO();
            io.to(`user_${order.user}`).emit("order:status", order);
            io.to("admins").emit("order:status", order);
        } catch (e) {
            console.warn("Socket emit skipped (order:cancel):", e.message);
        }




        res.json({

            message:"Order cancelled",

            order

        });





    }catch(error){


        res.status(500).json({

            message:error.message

        });

    }

};