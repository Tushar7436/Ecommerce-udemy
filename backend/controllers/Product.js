const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
const fs = require('fs');
const slugify = require('slugify');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Check admin role
const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    return user.role === "admin";
  } catch (error) {
    console.error("Error checking admin role:", error);
    return false;
  }
};

const createProduct = async (req, res) => {
  try {
    // Check if user has admin role
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "User does not have admin role" });
    }

    const {
      title,
      category,
      price,
      thumbnail,
      rating,
      discountPercentage,
      description,
      images,
      stock,
      brand
    } = req.body;

    // Upload thumbnail
    const thumbnailUpload = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath);
    // Remove thumbnail temp file
    fs.unlinkSync(req.files.thumbnail.tempFilePath);
    console.log("Thumbnail temp file deleted.");

    // Upload images
    const imagesUploadPromises = req.files.images.map(async (image) => {
      const result = await cloudinary.uploader.upload(image.tempFilePath);
      // Remove image temp file
      fs.unlinkSync(image.tempFilePath);
      console.log("Image temp file deleted.");
      return result.url;
    });

    // Wait for all images to upload
    const imagesUrls = await Promise.all(imagesUploadPromises);

    // Save data to database
    const product = await Product.create({
      title,
      slug: slugify(title).toLowerCase(),
      category,
      price,
      thumbnail: thumbnailUpload.url,
      rating,
      discountPercentage,
      description,
      images: imagesUrls,
      stock,
      brand
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllProducts = async (req ,res)=>{
     try {
      
      const products = await Product.find({})
      res.status(200).json(products)

     } catch (error) {
          console.error(error);
      res.status(500).json({ error: "An error occurred, products not found" });
     }
}


const getSingleProducts = async (req ,res)=>{
  try {
   const slug = req.params.slug.toLowerCase();
   const products = await Product.findOne({ slug })
   res.status(200).json(products)
  } catch (error) {
       console.error(error);
   res.status(500).json({ error: "An error occurred, products not found" });
  }
}


const updateProduct = async (req, res, next) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const product = await Product.findOne({ slug });

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    const updatedProduct = await Product.findOneAndUpdate({ slug }, req.body, {
      new: true,
    });

    res.status(200).json({ msg: "Product updated successfully", data: updatedProduct });
  } catch (err) {
    next(err);
  }
};





// Create order
const ordered = async (req, res) => {
  try {
    const userOrder = req.body;
    const newOrder = await Order.create(userOrder);
    res.status(200).json({
      message: "Ordered successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "An error occurred while processing the order" });
  }
};

module.exports = { ordered, createProduct ,getAllProducts,getSingleProducts,updateProduct };
