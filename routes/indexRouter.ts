import express, { Router }  from 'express';
const indexRouter = Router();
import * as papa from 'papaparse';
import * as db from '../pool/queries';
import { log } from 'node:console';


indexRouter.get("/", async (req, res) => 
{
    res.redirect("/items");
});

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

indexRouter.get("/items", async (req, res) => 
{
    console.log('loading page');
    
    const items = await db.getAllItems();
    var metaData = await db.calculateItemsMetaData();    

    metaData.totalValue = convertNumToString(metaData.totalValue);

    res.render("items", { items: items, metaData: metaData });
});

indexRouter.get("/dashboard", async (req, res) => 
{
    res.render("dashboard", { });
});

indexRouter.get("/lowstock", async (req, res) => 
{
    const allItems = await db.getAllItems();
    var metaData = await db.calculateItemsMetaData();    
    var lowItems = [];

    // Calculate low stock here
    for (let i=0; i<allItems.length; i++)
    {
        if (allItems[i].quantity < allItems[i].minimumLevel) {
            lowItems.push(allItems[i]);
        }
    }

    res.render("lowstock", { items: null });
});

indexRouter.get("/activityLog", async (req, res) => 
{
    res.render("activityLog", { });
});

indexRouter.get("/transactionReport", async (req, res) => 
{
    res.render("transactionReport", { });
});

indexRouter.get("/lowStockItems", async (req, res) => 
{
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

indexRouter.get("/edit/:itemIndex", async (req, res) => 
{
    const itemIndex = req.params.itemIndex;
    const items     = await db.getAllItems();
    res.render("itemDetails", { itemIndex: itemIndex, items: items });
});

indexRouter.get("/getItemById/:itemId", async (req, res) => 
{
    try
    {
        const item = await db.getItemById(req.params.itemId);
        res.send(item);
    } 
    catch (error) 
    {
        console.log("error getting item by Id: ", req.params.itemId,  error);
    }
});

indexRouter.get("/searchLowStock/:itemName", async (req, res) => 
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

indexRouter.get("/search/:itemName", async (req, res) => 
{
    var nameToSearch = req.params.itemName;
    var items;

    if (nameToSearch == "all") {
        items = await db.getAllItems();
    }
    else {
        items = await db.searchForItem(req.params.itemName);
    }

    res.send(items);
});

indexRouter.post("/edit/:itemIndex", async (req, res) =>
{
    console.log('update');
    
    const itemIndex     = Number(req.params.itemIndex);
    const value   = Number(req.body.itemQuantity) * Number(req.body.itemPrice);
    const oldItem = await db.getItemById(req.params.itemIndex);

    let stockOrdered = oldItem[0].stockOrdered;
    if (stockOrdered == null) 
        stockOrdered = false;

    // Log activity if quantity has changed
    if (oldItem[0].quantity != req.body.itemQuantity) {
        console.log('sldkfjsldfkjsldkjfkl');
        
        await db.logActivity('quantity', String(itemIndex), oldItem[0].name, String(oldItem[0].quantity), String(req.body.itemQuantity));

        const oldQuantity = oldItem[0].quantity;
        const newQuantity = req.body.itemQuantity;
    }

    // Reset stock ordered status if quantity is about minimum level
    if (req.body.itemQuantity > req.body.itemMinQuantity) {
        stockOrdered = false;    
    }

    await db.updateItem(itemIndex,
                        req.body.itemName,
                        req.body.itemQuantity,
                        req.body.itemMinQuantity,
                        req.body.itemPrice,
                        value,
                        req.body.itemBarcode,
                        req.body.itemNotes,
                        req.body.itemTags,
                        stockOrdered
                    );
    res.send();
});


indexRouter.post("/updateItemOrderedStatus", async (req, res) =>
{
    await db.updateItemOrderedStatus(req.body.itemId, req.body.stockOrdered);
    res.send();
});

indexRouter.post("/addItem", async (req, res) =>
{
    await db.addItem(
                        req.body.itemName,
                        req.body.itemQuantity,
                        req.body.itemMinQuantity,
                        req.body.itemPrice,
                        req.body.itemValue,
                        req.body.itemBarcode,
                        req.body.itemNotes,
                        req.body.itemTags
    );

    res.send();
});

indexRouter.post("/deleteItem", async (req, res) =>
{
	console.log('deleting', req.body.itemss);

    await db.deleteItem(req.body.itemId);
    res.send();
});

indexRouter.post("/deleteArrayOfItems", async (req, res) =>
{
    console.log('trying');
    
    await db.deleteArrayOfItems(req.body.items);
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
        const data = papa.unparse(rows, config);
        console.log(data);
        res.send(data);
    }
    catch {
        console.log('Failed to download csv');
        throw new Error('Error downlaoding csv'); // Express will catch this
    }

    res.redirect("/");
});

indexRouter.post("/new", async (req, res) => 
{
    console.log(`post ${req.body.name}`);
    const item = req.body;
    await db.addItem(item.itemName, item.quantity, item.minLevel, item.price);
    res.redirect("/");
});

indexRouter.get("/getTableMetaData", async (req, res) => 
{
    await db.calculateItemsMetaData();    
});

indexRouter.post('/deleteAllItems', async (req, res) =>
{
    await db.backupItemsTable();
    await db.deleteAllItems();
    await db.logActivity('delete all', null, null, null, null);
    res.redirect("/");
});

indexRouter.post('/logActivity', async (req, res) =>
{
    await db.logActivity(req.body.type, req.body.itemId, req.body.oldValue, req.body.newValue);
    res.redirect("/");
});

indexRouter.get('/getActivityLog', async (req, res) =>
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
        res.send('Error trying to undo: ', error)
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

async function undoDeleteAll()
{
    await db.overwriteItemsTableWithBackup();
}

export default indexRouter;