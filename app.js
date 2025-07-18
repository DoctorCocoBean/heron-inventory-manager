// TODO:
//Database passwood: wCBrkihVgfbs9PGV

// Be able to put in equation in quantity input 
// when editing quality and in the middle of equation, losing focus doesn't work
// ---------------------------------------------

// Use same inline calculation logic for quality input in item edit popup

// Delete doesn't delete the correct row. 

// When in main items page, editing quantity feels slow. Maybe batch calls to database?

// Succuss animated popup after certain actions are executes like saving 

// Convert to TypeScript

// Remove multiple items by selecting checkboxes?

// Validate update form inputs aren't null or weird characters

// Downloading/export csv

// Order by date or order by name

// Deleting all items while creating back up

// Record quantity change history

// Get most subtracted items

// View by tag

// Low items report

// ---------- Later ----------------- 

// Ctrl z undo
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

