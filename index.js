const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const userRoutes = require("./src/routes/userRoutes");
const authRoutes = require("./src/routes/authRoutes");
const plotRoutes = require("./src/routes/plotRoutes");

// Middleware to parse JSON bodies
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/plots", plotRoutes);

app.use("/", (req, res) => {
  res.send("API is Running");
});

// Start the server and listen on the specified por

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
