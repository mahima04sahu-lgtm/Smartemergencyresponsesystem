require("dns").setDefaultResultOrder("ipv4first");
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// MOVE TO TOP
app.use(cors());
app.use(express.json());

// GLOBAL LOGGER
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const alertRoutes = require("./routes/alertRoutes");
const staffRoutes = require("./routes/staffRoutes");
const systemRoutes = require("./routes/systemRoutes");

//  PUT YOUR MONGODB URL HERE
const MONGO_URI =
  process.env.MODE === "local"
    ? process.env.MONGO_LOCAL
    : process.env.MONGO_CLOUD;

mongoose.connect(MONGO_URI)
  .then(() => console.log(`MongoDB connected (${process.env.MODE})`))
  .catch(err => console.log(err));

app.use("/api", alertRoutes);
app.use("/api", staffRoutes);
app.use("/api", systemRoutes);

app.listen(5001, () => {
  console.log("Server running on port 5001");
});