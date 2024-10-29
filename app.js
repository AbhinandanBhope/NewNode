const express = require("express");
const sequelize = require("./database");
const User = require("./user");
const customerToContact = require("./contact");
const contactOrderItem = require("./contactOrder");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Test Route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// User creation endpoint
app.post("/users", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.create({ name, email, password });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Access Denied: No token provided." });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      const message = err.name === "TokenExpiredError" ? "Token Expired" : "Invalid Token";
      return res.status(403).json({ message });
    }
    req.user = user;
    next();
  });
};

// User login endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email, password } });

    if (!user)
      return res.status(400).json({ status: false, message: "Invalid email or password" });

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ status: true, message: "Login Successful", accessToken });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

// Contact form submission endpoint
app.post("/contact", async (req, res) => {
  const { name, email, message, phoneNumber ,productHSNCode } = req.body;

  try {
    const contact = await customerToContact.create({ name, email, message, phoneNumber ,productHSNCode });
    return res.status(201).json({ status: true, message: "Form Submitted Successfully", contact });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

// Get all contact submissions (with authentication)
app.get("/contact", authenticateToken, async (req, res) => {
  try {
    const contacts = await customerToContact.findAll();
    return res.status(200).json({ status: true, contacts });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

// Contact order submission endpoint
app.post("/contactOrder", async (req, res) => {
  const { name, email, message, phoneNumber, productName, quantity, productHSNCode } = req.body;

  try {
    const order = await contactOrderItem.create({
      name,
      email,
      message,
      phoneNumber,
      productName,
      quantity,
      productHSNCode,
    });
    return res.status(201).json({ status: true, message: "Inquiry Submitted Successfully", order });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

// Get all contact orders (with authentication)
app.get("/contactOrder", authenticateToken, async (req, res) => {
  try {
    const orders = await contactOrderItem.findAll();
    return res.status(200).json({ status: true, orders });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

// Function to ping an external API with retry logic
const pingApi = async (attempt = 1, maxAttempts = 5) => {
  const url = "https://newnode-zqdd.onrender.com/"; // Replace with actual endpoint
  try {
    const response = await axios.get(url);
    console.log(`Pinged ${url}:`, response.status);
  } catch (error) {
    if (attempt < maxAttempts) {
      console.warn(`Ping failed. Retrying... Attempt ${attempt} of ${maxAttempts}`);
      setTimeout(() => pingApi(attempt + 1, maxAttempts), 2000 * attempt); // Exponential backoff
    } else {
      console.error(`Error pinging ${url}:`, error.message);
    }
  }
};

// Set up the interval to ping the API every 15 minutes (900,000 milliseconds)
setInterval(() => pingApi(), 300000);

// Initial call to ping the API immediately on startup
pingApi();

// Retry logic for database connection
const connectWithRetry = async (retries = 5, delay = 2000) => {
  while (retries) {
    try {
      await sequelize.authenticate();
      console.log("Database connection has been established successfully.");
      await sequelize.sync({ alter: true }); // Sync database schema
      return;
    } catch (error) {
      retries -= 1;
      console.error(`Database connection failed. Retries left: ${retries}`, error.message);
      if (retries === 0) {
        console.error("Unable to connect to the database after multiple attempts.");
        process.exit(1); // Exit process if unable to connect
      }
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

// Database connection and server start
(async () => {
  try {
    await connectWithRetry();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start the server:", error.message);
  }
})();
