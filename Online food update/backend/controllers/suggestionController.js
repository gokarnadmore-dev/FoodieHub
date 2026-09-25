const Suggestion = require("../models/Suggestion");
const Food = require("../models/Food");
const { getIO } = require("../utils/socket");

exports.submitSuggestion = async (req, res) => {
  try {
    const { name, price, desc, image, suggestedBy } = req.body;

    if (!name || !price || !image) {
      return res.status(400).json({ message: "Name, price, and image are required" });
    }

    const suggestion = new Suggestion({
      user: req.user?.id,
      name,
      price,
      desc: desc || "",
      image,
      suggestedBy: suggestedBy || req.user?.name || "Guest"
    });

    await suggestion.save();

    try {
      getIO().to("admins").emit("suggestion:new", suggestion.toJSON ? suggestion.toJSON() : suggestion);
      if (req.user?._id) {
        getIO().to(`user_${req.user._id}`).emit("suggestion:new", suggestion.toJSON ? suggestion.toJSON() : suggestion);
      }
    } catch (socketErr) {
      console.warn("Socket emit skipped (suggestion:new):", socketErr.message);
    }

    res.status(201).json({ message: "Suggestion submitted successfully", suggestion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find().sort({ createdAt: -1 });
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMySuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find({
      $or: [
        { user: req.user.id },
        { suggestedBy: req.user.name }
      ]
    }).sort({ createdAt: -1 });
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveSuggestion = async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) return res.status(404).json({ message: "Suggestion not found" });

    if (suggestion.status !== "pending") {
        return res.status(400).json({ message: "Suggestion already processed" });
    }

    suggestion.status = "approved";
    await suggestion.save();

    try {
      const payload = suggestion.toJSON ? suggestion.toJSON() : suggestion;
      getIO().to("admins").emit("suggestion:updated", payload);
      if (suggestion.user) {
        getIO().to(`user_${suggestion.user}`).emit("suggestion:updated", payload);
      }
    } catch (socketErr) {
      console.warn("Socket emit skipped (suggestion:updated):", socketErr.message);
    }

    // Add to menu
    const food = new Food({
        name: suggestion.name,
        price: suggestion.price,
        description: suggestion.desc,
        details: suggestion.desc,
        image: suggestion.image,
        category: "Suggested", // Default category
        isAvailable: true
    });
    await food.save();

    res.json({ message: "Suggestion approved and added to menu", suggestion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectSuggestion = async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) return res.status(404).json({ message: "Suggestion not found" });

    suggestion.status = "rejected";
    await suggestion.save();

    try {
      const payload = suggestion.toJSON ? suggestion.toJSON() : suggestion;
      getIO().to("admins").emit("suggestion:updated", payload);
      if (suggestion.user) {
        getIO().to(`user_${suggestion.user}`).emit("suggestion:updated", payload);
      }
    } catch (socketErr) {
      console.warn("Socket emit skipped (suggestion:updated):", socketErr.message);
    }

    res.json({ message: "Suggestion rejected", suggestion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
