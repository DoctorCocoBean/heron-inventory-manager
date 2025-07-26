
// TODO:
//Database passwood: wCBrkihVgfbs9PGV

// Activity stores date in a way that can't be sorted
// Activity log date is accurate enough to sort 
// Undo stack should match up with activity log
// Added "are you sure" prompt before deleting all items
// Deleting all items while creating back up
// ---------------------------------------------

// Change itemIndex to itemId

// Process bar when uploading

// Be able to undo full item edits
// Ctrl z undo

// Double check Downloading/export csv

// View by tag

// figure out how to normalize items table ids

// ---------- Later ----------------- 

// For transactions, limit results by date range
// Be able to swtich data back and forth from sortly and InventoryAppss
// Create icons for different pages
// Use SolidJS

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

const PORT = 3000;
app.listen(PORT, () => 
{
    console.log(`----START----- (Port: ${PORT})`);
});