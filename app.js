// TODO:
//Database passwood: wCBrkihVgfbs9PGV

// Remove multiple items by selecting checkboxes?
// ---------------------------------------------

// Searching break row htmls

// Validate update form inputs aren't null or weird characters

// Downloading/export csv

// Deleting all items while creating back up

// View by tag

// ---------- Later ----------------- 

// For transactions, limit results by date range
// Be able to swtich data back and forth from sortly and InventoryAppss
// Create icons for different pages
// Ctrl z undo, delete, quantity
// Editing item Finish creating the form to edit items
// Need to render table from server on first load index is SolidJS
// Reload table with SolidJS
// Get most subtracted items

const express = require('express');
const path    = require("node:path");
const app     = express();

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Routers
const indexRouter = require("./routes/indexRouter");

app.use("/", indexRouter);
app.use((err, req, res, next) => 
{
    console.error('Error:', err.message);
    console.error(err.stack);

    res.status(err.status || 500).send(err.message);
});

const PORT = 3000;
app.listen(PORT, () => 
{
    console.log(`----START----- (Port: ${PORT})`);
});

