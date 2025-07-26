"use strict";
// Change itemIndex to itemId
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("node:path");
const app = express();
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
// Views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// Routers
const indexRouter_1 = require("./routes/indexRouter");
app.use("/", indexRouter_1.default);
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    console.error(err.stack);
    res.status(err.status || 500).send(err.message);
});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`----START----- (Port: ${PORT})`);
});
//# sourceMappingURL=app.js.map