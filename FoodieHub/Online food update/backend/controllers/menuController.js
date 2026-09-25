const Food = require("../models/Food");
const { getIO } = require("../utils/socket");

// Create menu item
exports.createMenu = async (req, res) => {
  try {
    const { name, description, category, price, quantity, isAvailable, ingredients, discount, details } = req.body;
    const cleanName = typeof name === "string" ? name.trim() : name;
    
    let image = req.body.image || "";
    if (req.file) {
      image = req.file.path.replace(/\\/g, "/");
    }

    const food = new Food({
      name: cleanName,
      description,
      category,
      price,
      quantity,
      isAvailable,
      ingredients: ingredients ? ingredients.split(',').map(item => item.trim()) : [],
      discount,
      details,
      image
    });

    const savedFood = await food.save();

    try {
      getIO().to("admins").emit("menu:new", savedFood);
    } catch (e) {
      console.warn("Socket emit skipped (menu:new):", e.message);
    }

    res.status(201).json({ message: "Menu item created successfully", food: savedFood });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all menu items
exports.getAllMenu = async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods); // Return array directly for easier frontend consumption
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single menu item
exports.getSingleMenu = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update menu item
exports.updateMenu = async (req, res) => {
  try {
    const { name, description, category, price, quantity, isAvailable, ingredients, discount, details } = req.body;
    const updateData = {
      name: typeof name === "string" ? name.trim() : name,
      description,
      category,
      price,
      quantity,
      isAvailable,
      discount,
      details
    };
    
    if (ingredients) {
      updateData.ingredients = ingredients.split(',').map(item => item.trim());
    }
    
    if (req.body.image) {
      updateData.image = String(req.body.image).replace(/\\/g, "/");
    }
    if (req.file) {
      updateData.image = req.file.path.replace(/\\/g, "/");
    }

    const food = await Food.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    try {
      getIO().to("admins").emit("menu:updated", food);
    } catch (e) {
      console.warn("Socket emit skipped (menu:updated):", e.message);
    }
    
    res.json({ message: "Menu item updated successfully", food });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete menu item
exports.deleteMenu = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    try {
      getIO().to("admins").emit("menu:deleted", { _id: req.params.id });
    } catch (e) {
      console.warn("Socket emit skipped (menu:deleted):", e.message);
    }

    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search Food
exports.searchFood = async (req, res) => {
  try {
    const keyword = req.query.search;
    const foods = await Food.find({
      name: { $regex: keyword, $options: "i" }
    });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Filter By Category
exports.getFoodByCategory = async (req, res) => {
  try {
    const foods = await Food.find({ category: req.params.category });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};