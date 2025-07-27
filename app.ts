
// TODO:
//Database passwood: wCBrkihVgfbs9PGV


// ---------------------------------------------

// Create icons for different pages

// Deploy version 1 of app

// ---------- Later ----------------- 

// Block undo if not an acceptable action
// For transactions, limit results by date range
// Use SolidJS
// View by tag
// Process bar when uploading
// Be able to undo full item edits by using JSON.stringify to conversion json to string for old and new valuess
// Normalize items table after deleting all items? alter sequence public.books_id_seq restart with 1;
// Use gallery of images like pinterest
// Dashbaord show low stock items in mini tables

import * as express from 'express';
import * as path from 'node:path';
const app   = express();

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Routers
import indexRouter from './routes/indexRouter';

app.use("/", indexRouter);
app.use((err, req, res, next) => 
{
    console.error('Error:', err.message);
    console.error(err.stack);

    res.status(err.status || 500).send(err.message);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => 
{
    console.log(`----START----- (Port: ${PORT})`);
});