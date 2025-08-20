import { Router }  from 'express';
const indexRouter = Router();
import * as papa from 'papaparse';
import * as db from '../pool/queries'; // For typescript
// import db from '../pool/queries';
import * as passport from 'passport';
import * as bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';

interface User {
  id: number;
  username: string;
  password: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
      userid?: number;
    }
    interface Request {
      logout(callback: (err: any) => void): void;
    }
  }
}

function ensureAuthenticated(req, res, next) 
{
    const debugMode = false;

    // if (!debugMode) {
        console.log('User is authenticated:', req.isAuthenticated());
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect("/sign-up");
    // } else {
    //     return next();
    // }
}

indexRouter.get("/", ensureAuthenticated, async (req, res) => 
{
    console.log('home');
    
    res.redirect("/items");
});

indexRouter.get("/sign-up", async (req, res) => 
{
    console.log('sign up page loading');
    res.render("signupForm");
});

indexRouter.get('/log-out', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/sign-up");
    });
});

indexRouter.post("/sign-up", async (req, res) => 
{
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await db.addUser(req.body.username, hashedPassword);
        console.log('redreisdlfsdlkf');
        
        // res.redirect("/");
        res.json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error signing up:", error);
        res.status(500).send("Internal Server Error");
    }
});

indexRouter.post("/log-in", 
    passport.authenticate('local', {
        successRedirect: '/items',
        failureRedirect: '/sign-up'
    })
);

indexRouter.get("/dashboard", ensureAuthenticated, async (req, res) => 
{
    let username = req.user ? req.user.username : "Guest";
    var metaData            = await db.calculateItemsMetaData();
        metaData.totalValue = metaData.totalValue;
    res.render("dashboard", { metaData, user: username });
});

indexRouter.get("/lowstock", ensureAuthenticated, async (req, res) => 
{
    let username = req.user ? req.user.username : "Guest";
    res.render("lowstock", { user: username });
});

indexRouter.get("/transactionReport", ensureAuthenticated, async (req, res) => 
{
    let username = req.user ? req.user.username : "Guest";
    res.render("transactionReport", { user: username });
});

indexRouter.get("/api/lowStockItems", async (req, res) => 
{
    console.log('get low stock');
    
    const allItems = await db.getAllItems();
    var metaData = await db.calculateItemsMetaData();    
    var lowItems = [];

    // Calculate low stock here
    for (let i=0; i<allItems.length; i++)
    {
        if (Number(allItems[i].quantity) < Number(allItems[i].minimumLevel)) {
            lowItems.push(allItems[i]);
        }
    }

    res.send(lowItems);
});

indexRouter.get("/lowStockitem/:itemName", async (req, res) => 
{
    var nameToSearch = req.params.itemName;
    var items;

    if (nameToSearch == "all") {
        items = await db.getAllLowStockItems();
    }
    else {
        items = await db.searchForLowStockItem(req.params.itemName);
    }

    res.send(items);
});

indexRouter.get("/items", ensureAuthenticated, async (req, res) => 
{
    let username = req.user ? req.user.username : "Guest";
    const userid = req.user ? req.user.id : 1;
    
    var   metaData            = await db.calculateItemsMetaData(userid);
          metaData.totalValue = metaData.totalValue;

    res.render("items", { user: username, metaData: metaData });
});

indexRouter.delete("/api/items", async (req, res) =>
{
    await db.deleteArrayOfItems(req.body.items);
    res.send();
});

indexRouter.get("/api/items", async (req, res) => 
{
    console.log('loading items');
    console.log('user is ', req.user ? req.user.username : "Guest");
    console.log('userid ', req.user.id);
    

    const items = await db.getAllItems();

    res.send(items);
});

indexRouter.get("/api/item/:itemId", async (req, res) => 
{
    try
    {
        const item = await db.getItemById(Number(req.params.itemId));
        res.send(item);
    } 
    catch (error) 
    {
        res.status(500).send({message: "Error getting item by Id"});
        console.log("error getting item by Id: ", req.params.itemId,  error);
    }
});

indexRouter.get("/api/itemsByName/:itemName", async (req, res) => 
{
    console.log('user is ', req.user ? req.user.username : "Guest");
    console.log('userid ', req.user ? req.user.id : 'no id');
    const userid = req.user ? req.user.id : 1;

    var nameToSearch = req.params.itemName;
    var items;

    if (nameToSearch == "all") {
        items = await db.getAllItems(userid);
    }
    else {
        items = await db.searchForItem(userid, req.params.itemName);
    }

    res.send(items);
});

indexRouter.put("/api/item", async (req, res) =>
{
    console.log('updating item 2');
    
    const itemId  = Number(req.body.id);
    const value   = Number(req.body.quantity) * Number(req.body.price);
    const oldItem = await db.getItemById(itemId);

    let stockOrdered = oldItem[0].stockOrdered;
    if (stockOrdered == null) 
        stockOrdered = false;

    // Log activity if quantity has changed
    if (oldItem[0].quantity != req.body.quantity) 
    {
        await db.logActivity('quantity', String(itemId), oldItem[0].name, String(oldItem[0].quantity), String(req.body.quantity));

        const oldQuantity = oldItem[0].quantity;
        const newQuantity = req.body.quantity;
    }

    // Log all variables
    console.log({
        'Item ID': itemId,
        'Item Value': value,
        'Previous Item Data': oldItem[0],
        'Stock Ordered Status': stockOrdered,
        'Item Name': req.body.name,
        'Item Quantity': req.body.quantity,
        'Minimum Level': req.body.minimumLevel,
        'Item Price': req.body.price,
        'Item Barcode': req.body.barcode,
        'Item Notes': req.body.notes,
        'Item Tags': req.body.tags
    });

    // Reset stock ordered status if quantity is about minimum level
    if (req.body.itemQuantity > req.body.itemMinQuantity) {
        stockOrdered = false;    
    }

    // If this items barcode is changing but the new barcode already exists, throw an error
    if (req.body.barcode != oldItem[0].barcode) {
        console.log('ran into error');
        
        res.status(500).json({message: "Barcode already exists for another item."});
        return;
    }

    await db.updateItem(itemId,
                        req.body.name,
                        req.body.quantity,
                        req.body.minimumLevel,
                        req.body.price,
                        value,
                        req.body.barcode,
                        req.body.notes,
                        req.body.tags,
                        stockOrdered
                    );
    res.send();
});

indexRouter.put("/api/item/name", async (req, res) =>
{
    try {
        const itemId  = Number(req.body.itemId);
        const item = await db.getItemById(itemId);
        const oldName = String(item[0].name);
        const newName = String(req.body.name);

        console.log(`Editing is name from ${oldName} to ${newName}`);
        
        if (oldName != newName) 
        {
            await db.logActivity('name', String(itemId), oldName, String(oldName), String(newName));
        }

        await db.updateItem(itemId,
                            newName,
                            item[0].quantity,
                            item[0].minimumLevel,
                            item[0].price,
                            item[0].value,
                            item[0].barcode,
                            item[0].notes,
                            item[0].tags,
                            item[0].stockOrdered
                        );
        res.send();
    } 
    catch (error) 
    {
        console.log(`Error changing name. ${error}`);
        console.log(`Stack. ${error.stack}`);
    }

    res.send();
});

indexRouter.put("/api/item/quantity", async (req, res) =>
{
    console.log('changing quantity');
    try {
        const itemId  = Number(req.body.itemId);
        const oldItem = await db.getItemById(itemId);
        const newQuantity = Number(oldItem[0].quantity) + Number(req.body.quantityChange);
        const value   = Number(oldItem[0].price) * newQuantity;

        let stockOrdered = oldItem[0].stockOrdered;
        if (stockOrdered == null) 
            stockOrdered = false;

        console.log(`edit amount  is: ${req.body.quantityChange}`);
        
        // Log activity if quantity has changed
        if (oldItem[0].quantity != newQuantity) 
        {
            await db.logActivity('quantity', String(itemId), oldItem[0].name, String(oldItem[0].quantity), String(newQuantity));
            console.log(`logging ${oldItem[0].name}`);
        }

        // Reset stock ordered status if quantity is about minimum level
        if (req.body.itemQuantity > req.body.itemMinQuantity) {
            stockOrdered = false;    
        }

        await db.updateItem(itemId,
                            oldItem[0].name,
                            String(newQuantity),
                            oldItem[0].minimumLevel,
                            oldItem[0].price,
                            value,
                            oldItem[0].barcode,
                            oldItem[0].notes,
                            oldItem[0].tags,
                            stockOrdered
                        );
        res.send();
    } 
    catch (error) 
    {
        console.log(`Error change quantity. ${error}`);
    }

    res.send();
});

indexRouter.put("/api/item/minimumLevel", async (req, res) =>
{
    try {
        const itemId  = Number(req.body.itemId);
        const item = await db.getItemById(itemId);
        const oldMinLevel = item[0].minimumLevel;
        const newMinLevel = req.body.minimumLevel;

        console.log(`Editing minimum level from ${oldMinLevel} to ${newMinLevel}`);
        
        if (oldMinLevel != newMinLevel) 
        {
            await db.logActivity('Minimum Level', String(itemId), item[0].name, String(oldMinLevel), String(newMinLevel));
        }

        await db.updateItem(itemId,
                            item[0].name,
                            item[0].quantity,
                            newMinLevel,
                            item[0].price,
                            item[0].value,
                            item[0].barcode,
                            item[0].notes,
                            item[0].tags,
                            item[0].stockOrdered
                        );
        res.send();
    } 
    catch (error) 
    {
        console.log(`Error changing minimum level. ${error}`);
        console.log(`Stack. ${error.stack}`);
    }

    res.send();
});

indexRouter.put("/api/item/price", async (req, res) =>
{
    try {
        const itemId  = Number(req.body.itemId);
        const item = await db.getItemById(itemId);
        const oldPrice = item[0].price;
        const newPrice = req.body.price;
        const value = Number(newPrice) * Number(item[0].quantity);

        console.log(`Editing price from ${oldPrice} to ${newPrice}`);
        
        if (oldPrice != newPrice) 
        {
            await db.logActivity('price', String(itemId), item[0].name, String(oldPrice), String(newPrice));
        }

        await db.updateItem(itemId,
                            item[0].name,
                            item[0].quantity,
                            item[0].minimumLevel,
                            newPrice,
                            value,
                            item[0].barcode,
                            item[0].notes,
                            item[0].tags,
                            item[0].stockOrdered
                        );
        res.send();
    } 
    catch (error) 
    {
        console.log(`Error changing price. ${error}`);
        console.log(`Stack. ${error.stack}`);
    }

    res.send();
});

indexRouter.put("/api/item/barcode", async (req, res) =>
{
    try {
        const itemId = Number(req.body.itemId);
        const item = await db.getItemById(itemId);
        const oldBarcode = item[0].barcode;
        const newBarcode = req.body.barcode;

        console.log(`Editing barcode from ${oldBarcode} to ${newBarcode}`);
        
        if (oldBarcode != newBarcode) 
        {
            await db.logActivity('barcode', String(itemId), item[0].name, String(oldBarcode), String(newBarcode));
        }

        await db.updateItem(itemId,
                            item[0].name,
                            item[0].quantity,
                            item[0].minimumLevel,
                            item[0].price,
                            item[0].value,
                            newBarcode,
                            item[0].notes,
                            item[0].tags,
                            item[0].stockOrdered
                        );
        res.send();
    } 
    catch (error) 
    {
        console.log(`Error changing barcode. ${error}`);
        console.log(`Stack. ${error.stack}`);
    }

    res.send();
});

indexRouter.put("/api/item/notes", async (req, res) =>
{
    try {
        const itemId = Number(req.body.itemId);
        const item = await db.getItemById(itemId);
        const oldNotes = item[0].notes;
        const newNotes = req.body.notes;

        console.log(`Editing notes from ${oldNotes} to ${newNotes}`);
        
        if (oldNotes != newNotes) 
        {
            await db.logActivity('notes', String(itemId), item[0].name, String(oldNotes), String(newNotes));
        }

        await db.updateItem(itemId,
                            item[0].name,
                            item[0].quantity,
                            item[0].minimumLevel,
                            item[0].price,
                            item[0].value,
                            item[0].barcode,
                            newNotes,
                            item[0].tags,
                            item[0].stockOrdered
                        );
        res.send();
    } 
    catch (error) 
    {
        console.log(`Error changing notes. ${error}`);
        console.log(`Stack. ${error.stack}`);
    }

    res.send();
});

indexRouter.post("/api/item", [
        body('quantity').isInt().withMessage("Quantity must be an integer."),
        body('minimumLevel').isInt().withMessage("Minimum level must be an integer."),
        body('price').isFloat().withMessage("Price must be a number."),
], async (req, res, next) =>
{
    try {
        const errors = validationResult(req);   
        if (!errors.isEmpty()) {
            return res.status(400).send({ message: `Invalid input - ${errors.array()[0].msg}` });
        }

        const value = Number(req.body.price) * Number(req.body.quantity);
        await db.addItem(
                            req.body.name,
                            req.body.quantity,
                            req.body.minimumLevel,
                            req.body.price,
                            value,
                            req.body.barcode,
                            req.body.notes,
                            req.body.tags
        );

        res.send();
    } catch(error) {
        console.log(`Error adding item. ${error}`);
        console.log(`Stack. ${error.stack}`);
        next(error);
        return res.status(400).send({ message: `Error adding item ${error}` });
    }
});

indexRouter.delete("/api/item", async (req, res) =>
{
	console.log('deleting', req.body.items);

    await db.deleteItem(req.body.itemId);
    res.send();
});

indexRouter.put("/api/itemOrderedStatus", async (req, res) =>
{
    await db.updateItemOrderedStatus(req.body.itemId, req.body.stockOrdered);
    res.send();
});

indexRouter.post("/uploadCSV", (req, res) => 
{
    console.log('Parsing... ');
    
    try {
    const data = papa.parse(req.body.csvData, 
    { 
        header: true,
        dynamicTyping: true,
        complete: function(results) 
        {
            console.log('Parsed csv data: ');
            for (let i = 1; i<results.data.length; i++) {
                console.log(results.data[i]['Entry Name'], results.data[i]['Quantity'],
                            results.data[i]['Min Level'], results.data[i]['Price'],
                            results.data[i]['Value'], results.data[i]['Notes'], results.data[i]['Tags'],
                            results.data[i]['Barcode/QR2-Data']
                );

                    db.addItem(results.data[i]['Entry Name'],
                                    results.data[i]['Quantity'],
                                    results.data[i]['Min Level'],
                                    results.data[i]['Price'],
                                    results.data[i]['Value'],
                                    results.data[i]['Barcode/QR2-Data'],
                                    results.data[i]['Notes'],
                                    results.data[i]['Tags'],
                                );
            }
        }
    });
    }
    catch {
        console.log('Failed to upload csv');
        throw new Error('Missing required parameter!'); // Express will catch this

    }

    res.redirect("/");
});

indexRouter.get("/downloadCSV", async (req, res) => 
{
    console.log('Parsing... ');
    
    try {
        const config = { delelimiter: "," }
        const rows = await db.getAllItems();
        let data: string = papa.unparse(rows, config);

        // Convert column names to be the same as Sortly
        let newlineCharIndex = data.indexOf('\n')
        let columnNames = data.substring(0, newlineCharIndex);
        columnNames = columnNames.replace('name', 'Entry Name');
        columnNames = columnNames.replace('quantity', 'Quantity');
        columnNames = columnNames.replace('minimumLevel', 'Min Level');
        columnNames = columnNames.replace('price', 'Price');
        columnNames = columnNames.replace('value', 'Value');
        columnNames = columnNames.replace('notes', 'Notes');
        columnNames = columnNames.replace('tags', 'Tags');
        columnNames = columnNames.replace('barcode', 'Barcode/QR2-Data');

        let rowData = data.slice(newlineCharIndex, data.length);
        const newData = columnNames + rowData;

        res.send(newData);
    }
    catch {
        console.log('Failed to download csv');
        throw new Error('Error downlaoding csv'); // Express will catch this
    }

    res.redirect("/");
});

indexRouter.delete('/allItems', async (req, res) =>
{
    await db.backupItemsTable();
    await db.deleteAllItems();
    await db.logActivity('delete all', null, null, null, null);
    res.redirect("/");
});

indexRouter.post('/logActivity', async (req, res) =>
{
    await db.logActivity(req.body.type, req.body.itemId, req.body.name, req.body.oldValue, req.body.newValue);
    res.redirect("/");
});

indexRouter.get("/activityLog", ensureAuthenticated, async (req, res) => 
{
    let username = req.user ? req.user.username : "Guest";
    res.render("activityLog", { user: username});
});

indexRouter.get('/api/activityLog', async (req, res) =>
{
    const rows = await db.getActivityLog();
    res.send(rows)
});

indexRouter.get("/undoCommand", async (req, res) =>
{
    try {
        const activtyLog = await db.getActivityLog();
        const log = activtyLog[0];

        switch (log.type) 
        {
            case 'quantity':
                undoQuantityChange(log.itemId, log.oldValue, log.newValue)
                break;
            case 'delete all':
                console.log('undo delete all');
                undoDeleteAll();
                break;
        }

        await db.removeActivityLogById(log.id);
    } catch (error) {
        res.send('Error trying to undo: ' + error)
    }

     res.send('Undo successful');
});

async function undoQuantityChange(itemId, oldQuantity, newQuantity)
{
    // Get item
    const item = (await db.getItemById(itemId))[0];
    const value   = Number(oldQuantity) * Number(item.price);
    const quantityChange = newQuantity - oldQuantity;
    const newValue = Number(item.quantity) - quantityChange;

    let stockOrdered = item.stockOrdered;
    if (stockOrdered == null) 
        stockOrdered = false;

    // Reset stock ordered status if quantity is about minimum level
    if (item.quantity > item.minimumLevel) {
        stockOrdered = false;    
    }

    await db.updateItem(itemId,
                        item.name,
                        newValue,
                        item.minimumLevel,
                        item.price,
                        value,
                        item.barcode,
                        item.notes,
                        item.tags,
                        stockOrdered
                    );
}

indexRouter.get("/api/itemsMetaData", async (req, res) => 
{
    console.log('getting meta data');
    var metaData = await db.calculateItemsMetaData();
    res.send(metaData);
});

async function undoDeleteAll()
{
    await db.overwriteItemsTableWithBackup();
}

function convertNumToString(num) 
{
    const decimalIndex   = num.indexOf('.');
    var beforeDecimalStr = num.substring(0, decimalIndex);
    var afterDecimalStr  = num.substring(decimalIndex, num.length);

    var arr = beforeDecimalStr.toString().split("");
    var numWithCommas = "";
    for (let i=0; i < arr.length; i++)
    {
        numWithCommas += arr[i];
        if (((arr.length-i-1) % 3 == 0) && i < arr.length-1) {
            numWithCommas += ",";
        }
    }
    var result = numWithCommas + afterDecimalStr;

    return result;
}

export default indexRouter;