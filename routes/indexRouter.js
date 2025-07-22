const { Router }  = require("express")
const indexRouter = Router();
const papa        = require("papaparse")
const db          = require("../pool/queries");

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
    for (var i=0; i < arr.length; i++)
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
    for (i=0; i<allItems.length; i++)
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
    for (i=0; i<allItems.length; i++)
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
    itemIndex     = Number(req.params.itemIndex);
    const value   = Number(req.body.itemQuantity) * Number(req.body.itemPrice);
    const oldItem = await db.getItemById(req.params.itemIndex);

    let stockOrdered = oldItem[0].stockOrdered;
    if (stockOrdered == null) 
        stockOrdered = false;

    // Log activity if quantity has changed
    if (oldItem[0].quantity != req.body.itemQuantity) {
        await db.logActivity('quantity', String(itemIndex), oldItem[0].name, String(oldItem[0].quantity), String(req.body.itemQuantity));
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
	console.log('deleting', req.body);

    await db.deleteItem(req.body.itemId);
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
            for (i = 1; i<results.data.length; i++) {
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

indexRouter.post("/new", async (req, res) => 
{
    console.log(`post ${req.body.name}`);
    item = req.body;
    await db.addItem(item.itemName, item.quantity, item.minLevel, item.price);
    res.redirect("/");
});

indexRouter.get("/getTableMetaData", async (req, res) => 
{
    await db.calculateItemsMetaData();    
});

indexRouter.post('/deleteAllItems', async (req, res) =>
{
	console.log('deleting all items');
    await db.deleteAllItems();
    res.redirect("/");
});

indexRouter.post('/logActivity', async (req, res) =>
{
	console.log('log');
    
    await db.logActivity(req.body.type, req.body.itemId, req.body.oldValue, req.body.newValue);
    res.redirect("/");
});

indexRouter.get('/getActivityLog', async (req, res) =>
{
	console.log('get log');
    const rows = await db.getActivityLog();
    res.send(rows)
});

module.exports = indexRouter