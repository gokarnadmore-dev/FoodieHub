const Order = require("../models/Order");

const allowedPaymentMethods = ["COD", "CARD", "UPI", "NETBANKING", "WALLET"];


// ======================
// CREATE PAYMENT
// ======================

exports.createPayment = async (req, res) => {

    try {

        const {
            orderId,
            paymentMethod
        } = req.body;



        if (!orderId || !paymentMethod || !allowedPaymentMethods.includes(paymentMethod)) {

            return res.status(400).json({

                message: "Order and payment method required"

            });

        }




        const order = await Order.findById(orderId);



        if (!order) {

            return res.status(404).json({

                message: "Order not found"

            });

        }





        order.paymentMethod = paymentMethod;


        // A scanned QR and a client-submitted reference are not proof of payment.
        // Keep the order pending until a verified provider callback is received.
        order.paymentStatus = "Pending";



        await order.save();

        try {
            const { getIO } = require("../utils/socket");
            const io = getIO();
            io.to(`user_${order.user}`).emit("order:status", order);
            io.to("admins").emit("order:status", order);
        } catch (e) {
            console.warn("Socket emit skipped (payment:create):", e.message);
        }

        res.json({

            message: "Payment submitted and awaiting provider verification",

            order

        });





    } catch (error) {


        res.status(500).json({

            message: error.message

        });

    }

};








// ======================
// GET PAYMENT STATUS
// ======================

exports.getPaymentStatus = async (req, res) => {


    try {


        const order = await Order.findById(
            req.params.id
        );



        if (!order) {

            return res.status(404).json({

                message:"Order not found"

            });

        }



        res.json({

            orderId: order._id,

            paymentMethod:
            order.paymentMethod,


            paymentStatus:
            order.paymentStatus

        });



    } catch(error) {


        res.status(500).json({

            message:error.message

        });

    }

};








// ======================
// REFUND PAYMENT
// ======================

exports.refundPayment = async (req,res)=>{


    try{


        const order = await Order.findById(
            req.params.id
        );



        if(!order){

            return res.status(404).json({

                message:"Order not found"

            });

        }



        order.paymentStatus = "Refunded";


        await order.save();

        try {
            const { getIO } = require("../utils/socket");
            const io = getIO();
            io.to(`user_${order.user}`).emit("order:status", order);
            io.to("admins").emit("order:status", order);
        } catch (e) {
            console.warn("Socket emit skipped (payment:refund):", e.message);
        }

        res.json({

            message:"Refund completed",

            order

        });



    }catch(error){


        res.status(500).json({

            message:error.message

        });

    }

};