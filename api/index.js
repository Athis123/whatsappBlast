const express = require("express");
const app = express();

app.use(express.json());

const authRouter = require("../server/auth");
const kontakRouter = require("../server/KontakController");
const historyRouter = require("../server/HistoryController");
const templateRouter = require("../server/TemplateController");
const blasterRouter = require("../server/blaster");

app.use("/api", authRouter);
app.use("/api", kontakRouter);
app.use("/api", historyRouter);
app.use("/api", templateRouter);
app.use("/api", blasterRouter);

module.exports = app;
