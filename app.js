// TODO:
//Database passwood: wCBrkihVgfbs9PGV

// Set up basic versions of dashboard and items pages
// Make sidebar a template
// Make side bar links active only when current page matches link
// ---------------------------------------------

// Press enter or escape to quit out of editing table row
// Fix error when pressing escape

// Only show up/down quanity button when mousing over quanity number

// onRowLoseFocus() - need to factor out the editing of row html and make sure it includes onclick=startEditingQuantity()

// Consolidate getItemById()

// Make quantity changes vverrrrrry easy

// Convert to typesscript

// Automatically calculate value when items changes price or quantity. Then reload page

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

