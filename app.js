const express = require("express");
const sequelize = require("./database");
const User = require("./user"); // Import the Sequelize instance
const customerToContact = require("./contact");
const contactOrderItem = require("./conatctOrder");
const jwt = require("jsonwebtoken"); // Import jsonwebtoken
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.post("/users", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Hash the password before saving
    // const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Get token from Bearer

  console.log("Token:", token); // Debug: Check the extracted token

  if (!token)
    return res
      .status(401)
      .json({ message: "Access Denied: No token provided." });

  console.log("Secret:", process.env.ACCESS_TOKEN_SECRET); // Debug: Check the secret key

  // Verify token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification error:", err); // Debug: Log verification error
      return res.status(403).json({ message: "Invalid Token" });
    }
    req.user = user; // Store user info in request
    next(); // Continue to the route
  });
};

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user and authenticate (for demo purposes, we assume authentication passed)
    const user = await User.findOne({ where: { email, password } });

    if (!user)
      return res
        .status(400)
        .json({ status: false, message: "Invalid email or password" });

    // Generate JWT
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    return res
      .status(200)
      .json({ status: true, message: "Login Successful", accessToken });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

app.post("/contact", async (req, res) => {
  const { name, email, message, phoneNumber } = req.body;

  try {
    // Hash the password before saving
    // const hashedPassword = await bcrypt.hash(password, 10);

    const user = await customerToContact.create({
      name,
      email,
      message,
      phoneNumber,
    });
    return res.status(201).json({
      status: true,
      message: "Form Submitted Successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

app.get("/contact", authenticateToken, async (req, res) => {
  const { name, email, message, phoneNumber } = req.body;

  try {
    // Hash the password before saving
    // const hashedPassword = await bcrypt.hash(password, 10);

    const user = await customerToContact.findAll();
    return res.status(201).json({
      status: true,
      user,
    });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

app.post("/contactOrder", async (req, res) => {
  const { name, email, message, phoneNumber, productName, quantity } = req.body;

  console.log("req.body", req.body);

  try {
    // Hash the password before saving
    // const hashedPassword = await bcrypt.hash(password, 10);

    const user = await contactOrderItem.create({
      name,
      email,
      message,
      phoneNumber,
      quantity,
      productName,
    });
    console.log("user", user);
    return res.status(201).json({
      status: true,
      message: "Inquiry Submitted Successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
});

app.get("/contactOrder", authenticateToken, async (req, res) => {
  const { name, email, message, phoneNumber } = req.body;

  try {
    // Hash the password before saving
    // const hashedPassword = await bcrypt.hash(password, 10);

    const user = await contactOrderItem.findAll();
    return res.status(201).json({
      status: true,
      user,
    });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

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
