const CateringPackage = require("../models/CateringPackage");
const CateringRequest = require("../models/CateringRequest");
const { getIO } = require("../utils/socket");

exports.getPackages = async (req, res) => {
  try {
    const packages = await CateringPackage.find();
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPackage = async (req, res) => {
  try {
    const { name, description, pricePerPerson, minGuests, items } = req.body;
    let image = req.file ? req.file.path : "";
    const newPackage = new CateringPackage({ name, description, pricePerPerson, minGuests, items: items ? items.split(',') : [], image });
    await newPackage.save();
    res.status(201).json({ message: "Package created successfully", package: newPackage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const { packageId, eventType, guestCount, eventDate, specialRequests } = req.body;
    const request = new CateringRequest({
      user: req.user.id,
      packageId,
      eventType,
      guestCount,
      eventDate,
      specialRequests
    });
    await request.save();

    try {
      const payload = request.toJSON ? request.toJSON() : request;
      getIO().to("admins").emit("catering:new", payload);
      getIO().to(`user_${req.user.id}`).emit("catering:updated", payload);
    } catch (socketErr) {
      console.warn("Socket emit skipped (catering:new):", socketErr.message);
    }

    res.status(201).json({ message: "Catering request submitted successfully", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserRequests = async (req, res) => {
  try {
    const requests = await CateringRequest.find({ user: req.user.id }).populate('packageId');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await CateringRequest.find().populate('user', 'name email').populate('packageId');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
