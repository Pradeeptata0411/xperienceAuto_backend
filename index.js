// normal adding data like text and discription in the data base

// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// const port = 5000;

// // Middleware
// app.use(cors()); // Update origin as needed
// app.use(bodyParser.json());

// // MongoDB Connection
// const mongoURI = process.env.MONGO_URI;

// mongoose
//   .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((err) => console.error('MongoDB connection error:', err));

// // Define a Schema
// const itemSchema = new mongoose.Schema({
//   name: String,
//   description: String,
// });

// // Define a Model
// const Item = mongoose.model('Item', itemSchema);

// app.get('/', (req, res) => {
//     res.send('<h1>Hello, Hi!</h1>');
// });

// // API Routes
// app.get('/items', async (req, res) => {
//   try {
//     const items = await Item.find();
//     res.json(items);
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });

// app.post('/items', async (req, res) => {
//   const { name, description } = req.body;
//   try {
//     const newItem = new Item({ name, description });
//     await newItem.save();
//     res.status(201).json(newItem);
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });

// app.delete('/items/:id', async (req, res) => {
//   const { id } = req.params;
//   console.log(`Delete request for ID: ${id}`); // Debugging log
//   try {
//     const deletedItem = await Item.findByIdAndDelete(id);
//     if (!deletedItem) {
//       return res.status(404).json({ message: 'Item not found' });
//     }
//     res.json({ message: 'Item deleted successfully', deletedItem });
//     console.log(`Item deleted successfully`);
//   } catch (err) {
//     console.error(err); // Debugging log
//     res.status(500).send(err.message);
//   }
// });

// // Start Server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();



const multer = require("multer"); // for handling file uploads
const path = require("path");



app.use(bodyParser.json());
app.use(cors());

const nodemailer = require("nodemailer");

// Serve static files (e.g., uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


//const MONGO_URI = "mongodb://localhost:27017/reactnew";
// mongoose
//   .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("Connected to mongodb"))
//   .catch((err) => console.error("Could not connect to MongoDb :", err));


const MONGO_URI = "mongodb+srv://pradeep:pradeep@cluster0.9xzlb.mongodb.net/";


// const MONGO_URI = "mongodb://localhost:27017/reactnew";
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to mongodb"))
  .catch((err) => console.error("Could not connect to MongoDb :", err));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
  contact_no: { type: Number, required: true },
});

const Register_data = mongoose.model("Register_data", userSchema);

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, gender, contact_no } = req.body;

    // Check for missing fields
    if (!name || !email || !password || !gender || !contact_no) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const existingUser = await Register_data.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create and save new user
    const newuser = new Register_data({
      name,
      email,
      password,
      gender,
      contact_no,
    });
    await newuser.save();

    res.status(201).json({ message: "User Registered Successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All Fileds are required" });
    }

    const user = await Register_data.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "user Not found" });
    }

    if (user.password != password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      name: user.name, // Ensure the name is sent back
      email: user.email,
      contact_no: user.contact_no,
      gender: user.gender,
    });
  } catch (error) {
    console.error("error during login", error);
    res.status(500).json({ message: "server error" });
  }
});

// service requests

const serviceRequestSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  serviceType: { type: String, required: true },
  serviceDate: { type: Date, required: true },
  serviceTime: { type: String, required: true }, // Use String for time
  descriptionOfService: { type: String, required: true, maxlength: 500 },
  serviceStatus: { type: Boolean, required: true },
  serviceOwnerMail: { type: String, required: true },
  serviceAcceptedby: { type: String, required: false },
  serviceLocation: { type: String, required: false },
  serviceAdminEmail: { type: String, required: false },
});

const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema);

// API Endpoint
app.post("/customer/serviceRequest", async (req, res) => {
  try {
    const {
      serviceName,
      serviceType,
      serviceDate,
      serviceTime,
      descriptionOfService,
      serviceStatus,
      serviceOwnerMail,
    } = req.body;

    // Check for missing fields
    if (
      !serviceName ||
      !serviceType ||
      !serviceDate ||
      !serviceTime ||
      !descriptionOfService ||
      !serviceStatus ||
      !serviceOwnerMail
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate requests
    const existingRequest = await ServiceRequest.findOne({
      descriptionOfService,
    });
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A request with this description already exists" });
    }

    // Create and save new request
    const newServiceRequest = new ServiceRequest({
      serviceName,
      serviceType,
      serviceDate,
      serviceTime,
      descriptionOfService,
      serviceStatus,
      serviceOwnerMail,
    });

    await newServiceRequest.save();
    res.status(201).json({ message: "Service requested successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/viewmyrequests/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const serviceRequests = await ServiceRequest.find({
      serviceOwnerMail: email,
    });

    if (!serviceRequests || serviceRequests.length === 0) {
      return res
        .status(404)
        .json({ message: "No requests found for this email." });
    }

    res.status(200).json(serviceRequests);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});




app.get("/customer/viewProducts", async (req, res) => {
  try {
    const products = await Product.find({});
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found." });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});






//seller register data

const Seller_Register_Schema = new mongoose.Schema({
  sellerName: { type: String, required: true },
  sellerEmail: { type: String, required: true, unique: true },
  sellerPassword: { type: String, required: true },
  sellerGender: { type: String, required: true },
  sellerContact_no: { type: Number, required: true },
  sellerStatus: { type: Boolean, required: true },
});

const Seller_Register_data = mongoose.model(
  "Seller_Register_data",
  Seller_Register_Schema
);

app.post("/sellerRegisterData", async (req, res) => {
  try {
    const {
      sellerName,
      sellerEmail,
      sellerPassword,
      sellerGender,
      sellerContact_no,
      sellerStatus,
    } = req.body;

    // Check for missing fields
    if (
      !sellerName ||
      !sellerEmail ||
      !sellerPassword ||
      !sellerGender ||
      !sellerContact_no ||
      !sellerStatus
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const existingSeller = await Register_data.findOne({ sellerEmail });
    if (existingSeller) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create and save new user
    const newseller = new Seller_Register_data({
      sellerName,
      sellerEmail,
      sellerPassword,
      sellerGender,
      sellerContact_no,
      sellerStatus,
    });
    await newseller.save();

    res.status(201).json({ message: "Seller Registered Successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/sellerLogin", async (req, res) => {
  try {
    const { sellerEmail, sellerPassword  , sellerStatus} = req.body;

    // Ensure email and password are provided
    if (!sellerEmail || !sellerPassword) {
      return res
        .status(400)
        .json({ message: "Both email and password are required" });
    }

    const seller = await Seller_Register_data.findOne({ sellerEmail });
    if (!seller) {
      return res.status(400).json({ message: "User not found" });
    }

    if (seller.sellerPassword !== sellerPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }


    if(seller.sellerStatus === false){
      return res.status(400).json({ message: "awaiting your acceptance for login by admin" });
    }

    res.status(200).json({
      message: "Login successful",
      sellerName: seller.sellerName,
      sellerEmail: seller.sellerEmail,
      sellerPassword: seller.sellerPassword,
      sellerGender: seller.sellerGender,
      sellerContact_no: seller.sellerContact_no,
      sellerStatus: seller.sellerStatus,
    });
  } catch (error) {
    console.error("Error during login", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
});




const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  manufacturer: { type: String, required: true },
  sellerName: { type: String, required: true },
  sellerEmail: { type: String, required: true },
  productPrice: { type: Number, required: true },
  productImage: { type: String, required: true },
});

const Product = mongoose.model("Product", productSchema);

// File upload setup using Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
      const fileExtension = path.extname(file.originalname);
      cb(null, Date.now() + fileExtension);
  },
});

const upload = multer({ storage: storage });

// Add Product API route
app.post("/seller/addProduct", upload.single("product_image"), async (req, res) => {
  try {
      const { product_name, product_description, seller_name, seller_Email, product_price } = req.body;
      const productImage = req.file ? req.file.filename : null;

      if (!productImage) {
          return res.status(400).json({ message: "Image is required" });
      }

      const newProduct = new Product({
          productName: product_name,
          manufacturer: product_description,
          sellerName: seller_name,
          sellerEmail: seller_Email,
          productPrice: product_price,
          productImage: productImage,
      });

      await newProduct.save();
      res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error adding product", error: error.message });
  }
});



app.get('/seller/view-products/:email', async (req, res) => {
  const { email } = req.params;  // Get email from URL params

  if (!email) {
    return res.status(400).json({ error: 'Seller email is required' });
  }

  try {
    // Query to find products by seller's email
    const products = await Product.find({ sellerEmail: email });
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found for this seller' });
    }
    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.delete("/seller/deleteProduct/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
});

app.put("/updateProduct/:id", async (req, res) => {
  try {
    const { productName, manufacturer, productPrice } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { productName, manufacturer, productPrice },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error });
  }
});




// ******************  ADMIN   ****************************************

const adminSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userEmail: { type: String, required: true }, // Remove `unique` here
  userAddress: { type: String, required: true },
});

const admindata = mongoose.model("admin_access_data", adminSchema);

app.post("/admin/adminLogin", async (req, res) => {
  try {
    const { userName, password } = req.body;

    // Check if all fields are provided
    if (!userName || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the admin exists
    const admin = await admindata.findOne({ userName });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Validate password (assuming you store hashed passwords)
    // Example: Use bcrypt for hashing
    const isPasswordValid = password === admin.password; // Replace with hashed password validation (e.g., bcrypt.compare)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Send successful response
    res.status(200).json({
      message: "Login Successful",
      userName: admin.userName,
      userEmail: admin.userEmail,
      userAddress: admin.userAddress,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/admin/view-all-requests", async (req, res) => {
  try {
    const serviceRequests = await ServiceRequest.find({});
    // console.log("Fetched service requests:", serviceRequests);

    if (!serviceRequests || serviceRequests.length === 0) {
      return res.status(404).json({ message: "No service requests found." });
    }

    res.status(200).json(serviceRequests);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/admin/admin-viewAll-customers", async (req, res) => {
  try {
    const customersData = await Register_data.find({});

    if (!customersData || customersData.length === 0) {
      return res.status(404).json({ message: "No customer found" });
    }
    res.status(200).json(customersData);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/admin/admin-viewAll-sellers", async (req, res) => {
  try {
    const sellerData = await Seller_Register_data.find({});

    if (!sellerData || sellerData.length === 0) {
      return res.status(404).json({ message: "No customer found" });
    }
    res.status(200).json(sellerData);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


app.get("/admin/view-all-products", async (req, res) => {
  try {
    const products = await Product.find({});
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found." });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});




app.put("/admin/status-action", async (req, res) => {
  const {
    serviceName,
    serviceType,
    serviceTime,
    serviceDate,
    descriptionOfService,
    serviceStatus,
    adminName,
    adminEmail,
    adminAddress,
  } = req.body;

  console.log("Received request:", req.body); // Log input data for debugging

  try {
    // Log the query parameters
    console.log("Query values:", {
      serviceName,
      serviceType,
      serviceDate,
      serviceTime,
      descriptionOfService,
    });

    const updatedRequest = await ServiceRequest.findOneAndUpdate(
      {
        serviceName,
        serviceType,
        serviceTime,
        serviceDate,
        descriptionOfService,
      },
      {
        $set: {
          serviceStatus,
          serviceAcceptedby: adminName,
          serviceAdminEmail: adminEmail,
          serviceLocation: adminAddress,
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedRequest) {
      console.log("No matching request found"); // Log when no document is found
      return res.status(404).json({ message: "Service request not found." });
    }

    res
      .status(200)
      .json({
        message: "Service status updated successfully.",
        updatedRequest,
      });
  } catch (err) {
    console.error("Error updating service status:", err);
    res
      .status(500)
      .json({
        message: "Failed to update service status.",
        error: err.message,
        stack: err.stack,
      });
  }
});

// const newAdmin = new admindata({
//   userName: "Cherry",
//   password: "Cherry@123",
//   userEmail: "cherry@gmail.com", // Ensure no duplicates
//   userAddress: "hyderabad, manikonda, telangana",
// });

// (async () => {
//   try {
//     await newAdmin.save();
//     console.log("Admin data saved successfully!");
//   } catch (err) {
//     if (err.code === 11000) {
//       console.error("Duplicate key error: ", err.keyValue);
//     } else {
//       console.error("Error saving admin data:", err);
//     }
//   }
// })();

// customer mail service

const CUSTOMER_CARE_EMAIL = "jfsdsdpams@gmail.com";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Gmail SMTP host
  port: 465, // Secure SMTP port
  secure: true, // Use SSL/TLS
  auth: {
    user: CUSTOMER_CARE_EMAIL, // Default customer care email
    pass: "cqhr ipwf xosa ymwl", // Replace with your app password
  },
  logger: true, // Enable detailed logging
  debug: true, // Enable debug output
});

app.post("/send-email", async (req, res) => {
  const { userEmail, message } = req.body;

  // Validate inputs
  if (!userEmail || !message) {
    return res
      .status(400)
      .json({ error: "User email and message are required" });
  }

  // Email options: Send from CUSTOMER_CARE_EMAIL to the userEmail
  const mailOptions = {
    from: CUSTOMER_CARE_EMAIL, // Your customer care email
    to: userEmail, // Send email to the user
    subject: "Response to Your Inquiry",
    text: message, // Include the message content
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});


app.put("/admin/accept-seller_status_action", async (req, res) => {
  const {
    sellerName,
    sellerEmail,
    sellerGender,
    sellerContact_no,
    sellerStatus,
  } = req.body;

  try {
    const updatedRequest = await Seller_Register_data.findOneAndUpdate(
      {
       sellerName,
       sellerEmail,
       sellerGender,
       sellerContact_no,
      },
      {
        $set: {
          sellerStatus
        },
      },
      { new: true } 
    );

    if (!updatedRequest) {
      console.log("No matching request found"); // Log when no document is found
      return res.status(404).json({ message: "Service request not found." });
    }

    res
      .status(200)
      .json({
        message: "Service status updated successfully.",
        updatedRequest,
      });
  } catch (err) {
    console.error("Error updating service status:", err);
    res
      .status(500)
      .json({
        message: "Failed to update service status.",
        error: err.message,
        stack: err.stack,
      });
  }
});











// const PORT = 5000;

// app.listen(PORT, () => console.log(`Server Running on port ${PORT}`));



const PORT = process.env.PORT || 5000; // Use Render-assigned port

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});