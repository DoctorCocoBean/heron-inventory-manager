// TODO:

// *Update table row html when edited

// Need to render table from server


// Uploading csv should be popup

// Add Item
// Remove Item
// Remove multiple items

// Editing item Finish creating the form to edit items
// Validate update form inputs aren't null or weird characters

// Downloading csv

// Deleting all items while creating back up

// Reload table with solid

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
    console.error(err);
    res.status(err.status || 500).send(err.message);
});

const PORT = 3000;
app.listen(PORT, () => 
{
    console.log(`----START----- (Port: ${PORT})`);
});

