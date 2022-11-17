const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
dotenv.config();
const PORT = process.env.PORT;
const DB = process.env.DB;

mongoose.connect(DB,()=>{
    console.log("connection successfull");
})

app.use(express.json());
app.use('/api/auth', require('./routes/auth'))

app.listen(PORT,()=>{
    console.log(`Listning to the port localhost ${PORT}`);
})