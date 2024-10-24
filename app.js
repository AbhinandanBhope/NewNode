const express = require("express");
const sequelize = require("./database");
const User = require("./user");
const customerToContact = require("./contact");
const contactOrderItem = require("./conatctOrder");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.post("/users", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.create({ name, email, password });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ message: "Access Denied: No token provided." });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid Token" });
    }
    req.user = user;
    next();
  });
};

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

app.post("/contact", async (req, res) => {
  const { name, email, message, phoneNumber } = req.body;

  try {
    const user = await customerToContact.create({ name, email, message, phoneNumber });
    return res.status(201).json({ status: true, message: "Form Submitted Successfully", user });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

app.get("/contact", authenticateToken, async (req, res) => {
  try {
    const user = await customerToContact.findAll();
    return res.status(200).json({ status: true, user });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

app.post("/contactOrder", async (req, res) => {
  const { name, email, message, phoneNumber, productName, quantity } = req.body;

  try {
    const user = await contactOrderItem.create({ name, email, message, phoneNumber, quantity, productName });
    return res.status(201).json({ status: true, message: "Inquiry Submitted Successfully", user });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

app.get("/contactOrder", authenticateToken, async (req, res) => {
  try {
    const user = await contactOrderItem.findAll();
    return res.status(200).json({ status: true, user });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

// Function to ping an external API
const pingApi = async () => {
  const url = "https://newnode-zqdd.onrender.com/"; // Replace with the actual endpoint
  try {
    const response = await axios.get(url);
    console.log(`Pinged ${url}:`, response.status);
  } catch (error) {
    console.error(`Error pinging ${url}:`, error.message);
  }
};

// Set up the interval to ping the API every 15 minutes (900,000 milliseconds)
setInterval(pingApi, 900000);

// Initial call to ping the API immediately on startup
pingApi();

// Database connection and server start
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
    await sequelize.sync();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();
