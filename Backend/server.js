const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const apiRoutes = require("./src/routes/apiRoutes");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
