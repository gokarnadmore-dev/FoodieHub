const router = require("express").Router();
const { getPackages, createPackage, createRequest, getUserRequests, getAllRequests } = require("../controllers/cateringController");
const { protect, admin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Get all packages
router.get("/packages", getPackages);

// Create new package
router.post("/packages", protect, admin, upload.single("image"), createPackage);

// Submit a catering request
router.post("/requests", protect, createRequest);

// Get user's requests
router.get("/myrequests", protect, getUserRequests);

// Get all requests (admin)
router.get("/requests", protect, admin, getAllRequests);

// Cancel a request
router.put("/requests/cancel/:id", protect, async (req, res) => {
    try {
        const CateringRequest = require("../models/CateringRequest");
        const { getIO } = require("../utils/socket");
        const request = await CateringRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Not found" });
        request.status = "Cancelled";
        await request.save();

        try {
            const payload = request.toJSON ? request.toJSON() : request;
            getIO().to("admins").emit("catering:updated", payload);
            getIO().to(`user_${req.user.id}`).emit("catering:updated", payload);
        } catch (socketErr) {
            console.warn("Socket emit skipped (catering:updated):", socketErr.message);
        }

        res.json({ message: "Cancelled successfully", request });
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
