// ======================
// ADMIN AUTH MIDDLEWARE
// ======================


const adminMiddleware = (req, res, next) => {

    try {


        // check user exists
        if (!req.user) {

            return res.status(401).json({

                message: "Unauthorized access"

            });

        }




        // check admin role

        if (req.user.role !== "admin") {

            return res.status(403).json({

                message: "Admin access only"

            });

        }




        next();



    } catch (error) {


        res.status(500).json({

            message: error.message

        });


    }

};



module.exports = adminMiddleware;