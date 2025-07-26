"use strict";
// TODO:
//Database passwood: wCBrkihVgfbs9PGV
Object.defineProperty(exports, "__esModule", { value: true });
// Activity stores date in a way that can't be sorted
// Activity log date is accurate enough to sort 
// Undo stack should match up with activity log
// Added "are you sure" prompt before deleting all items
// Deleting all items while creating back up
// Change itemIndex to itemId
// Dashboard
// Try uploaded a downloaded csv
// ---------------------------------------------
// Create icons for different pages
// Deploy version 1 of app
// ---------- Later ----------------- 
// Block undo if not an acceptable action
// For transactions, limit results by date range
// Be able to swtich data back and forth from sortly and InventoryApp
// Use SolidJS
// View by tag
// Process bar when uploading
// Be able to undo full item edits by using JSON.stringify to conversion json to string for old and new valuess
// Normalize items table after deleting all items? alter sequence public.books_id_seq restart with 1;
// Use gallery of images like pinterest
// Dashbaord show low stock items in mini tables
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