const { Router }  = require("express")
const indexRouter = Router();
const papa        = require("papaparse")
const db          = require("../pool/queries");

indexRouter.get("/", async (req, res) => 
{
    res.redirect("/items");
});

indexRouter.get("/items", async (req, res) => 
{
    console.log('loading page');
    const items = await db.getAllItems();
    const metaData = await db.calculateItemsMetaData();    

    res.render("items", { title: "Inventory", items: items, metaData: metaData });
});

indexRouter.get("/dashboard", async (req, res) => 
{
    res.render("dashboard", { });
});

indexRouter.get("/edit/:itemIndex", async (req, res) => 
{
    const itemIndex = req.params.itemIndex;
    const items     = await db.getAllItems();
    res.render("itemDetails", { itemIndex: itemIndex, items: items });
});

indexRouter.get("/itemByIndex/:itemIndex" , async (req, res) => 
{
    const item = await db.getItemById(req.params.itemIndex);
    console.log('item', item);
    res.send(item);
});

indexRouter.get("/getItemById/:itemId", async (req, res) => 
{
    console.log('trying to get item', req.params.itemId);
    
    const itemId = req.params.itemId;
    const row = await db.getItemById(itemId);
    console.log('found', row);

    res.send(row);
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
    itemIndex   = Number(req.params.itemIndex);
    const value = Number(req.body.itemQuantity) * Number(req.body.itemPrice);

    await db.updateItem(itemIndex,
                        req.body.itemName,
                        req.body.itemQuantity,
                        req.body.itemMinQuantity,
                        req.body.itemPrice,
                        value,
                        req.body.itemBarcode,
                        req.body.itemNotes,
                        req.body.itemTags
                    );
    res.send();
});

indexRouter.post("/addItem", async (req, res) =>
{
	console.log('about to add item', req.body);

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

module.exports = indexRouter