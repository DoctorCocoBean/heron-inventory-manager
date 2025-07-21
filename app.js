// TODO:
//Database passwood: wCBrkihVgfbs9PGV

// Price is missing dollar sign
// ---------------------------------------------

// Separate transaction page and activity page

// Add item title to transaction log

// Be able to mark low stock item as ordered

// Activity Log

// Get most subtracted items

// On low stock page, make search confined to lowstock items

// On delete item show info popup

// quality edit button are too close making it hard to press number which triggers editing mode

// Remove multiple items by selecting checkboxes?

// Validate update form inputs aren't null or weird characters

// Downloading/export csv

// Order by date or order by name

// Deleting all items while creating back up

// View by tag

// ---------- Later ----------------- 

// Ctrl z undo, delete, quantity
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

