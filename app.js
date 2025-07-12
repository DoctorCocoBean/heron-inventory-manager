// TODO:
//Database passwood: wCBrkihVgfbs9PGV

// Improve quality adjustment buttons layout
// On select quantity number and input box is created, selected text so it can be immediately changed
// Automatically calculate value when items changes price or quantity. Then reload page
// ---------------------------------------------

// Consolidate getItemById()

// Convert to typesscript

// Upgrade side bar so it looks better.

// Remove multiple items by selecting checkboxes?

// Validate update form inputs aren't null or weird characters

// Downloading/export csv

// Order by date or order by name

// Deleting all items while creating back up

// Record quantity change history

// Get most subtracted items

// ---------- Later ----------------- 
// Editing item Finish creating the form to edit items
// Need to render table from server on first load index is SolidJS
// Reload table with SolidJS

const express = require('express');
const path    = require("node:path");
const app     = express();

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

