require("dns").setDefaultResultOrder("ipv4first");
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const alertRoutes = require("./routes/alertRoutes");

const app = express();

app.use(cors());
app.use(express.json());

//  PUT YOUR MONGODB URL HERE
const MONGO_URI =
  process.env.MODE === "local"
    ? process.env.MONGO_LOCAL
    : process.env.MONGO_CLOUD;

mongoose.connect(MONGO_URI)
  .then(() => console.log(`MongoDB connected (${process.env.MODE})`))
  .catch(err => console.log(err));

app.use("/api", alertRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});