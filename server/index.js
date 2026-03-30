const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();


connectDB();

const app = express();




app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);


app.use(express.json());



app.use("/api/auth", require("./routes/auth"));
app.use("/api/sessions", require("./routes/sessions"));


app.get("/", (req, res) => {
  res.status(200).send("Vi-Notes API running 🚀");
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});