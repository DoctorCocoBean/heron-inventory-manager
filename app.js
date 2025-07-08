// TODO:
//Database passwood: wCBrkihVgfbs9PGV

// Add Item
// ---------------------------------------------

// Remove Item
// Remove multiple items by selecting checkboxes?
// Uploading csv should be popup

// Editing item Finish creating the form to edit items
// Validate update form inputs aren't null or weird characters

// Downloading csv

// Order by date or order by name

// Deleting all items while creating back up

// Reload table with SolidJS

// ---------- Maybe ----------------- 
// Need to render table from server on first load index is SolidJS

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

