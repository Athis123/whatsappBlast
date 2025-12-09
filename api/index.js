const express = require("express");
const app = express();

app.use(express.json());

const authRouter = require("../server/auth"); 

app.use("/", authRouter); 

module.exports = app;
