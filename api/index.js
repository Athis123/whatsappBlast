const express = require("express");
const app = express();

app.use(express.json());

const authRouter = require("../server/auth");

app.use("/", authRouter);

app.listen(3000, () => console.log("API running on port 3000"));

module.exports = app;
