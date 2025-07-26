"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const indexRouter = (0, express_1.Router)();
const papa = require("papaparse");
const db = require("../pool/queries");
indexRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.redirect("/items");
}));
function convertNumToString(num) {
    const decimalIndex = num.indexOf('.');
    var beforeDecimalStr = num.substring(0, decimalIndex);
    var afterDecimalStr = num.substring(decimalIndex, num.length);
    var arr = beforeDecimalStr.toString().split("");
    var numWithCommas = "";
    for (let i = 0; i < arr.length; i++) {
        numWithCommas += arr[i];
        if (((arr.length - i - 1) % 3 == 0) && i < arr.length - 1) {
            numWithCommas += ",";
        }
    }
    var result = numWithCommas + afterDecimalStr;
    return result;
}
indexRouter.get("/items", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('loading page');
    const items = yield db.getAllItems();
    var metaData = yield db.calculateItemsMetaData();
    metaData.totalValue = convertNumToString(metaData.totalValue);
    res.render("items", { items: items, metaData: metaData });
}));
indexRouter.get("/dashboard", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("dashboard", {});
}));
indexRouter.get("/lowstock", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allItems = yield db.getAllItems();
    var metaData = yield db.calculateItemsMetaData();
    var lowItems = [];
    // Calculate low stock here
    for (let i = 0; i < allItems.length; i++) {
        if (allItems[i].quantity < allItems[i].minimumLevel) {
            lowItems.push(allItems[i]);
        }
    }
    res.render("lowstock", { items: null });
}));
indexRouter.get("/activityLog", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("activityLog", {});
}));
indexRouter.get("/transactionReport", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("transactionReport", {});
}));
indexRouter.get("/lowStockItems", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allItems = yield db.getAllItems();
    var metaData = yield db.calculateItemsMetaData();
    var lowItems = [];
    // Calculate low stock here
    for (let i = 0; i < allItems.length; i++) {
        if (Number(allItems[i].quantity) < Number(allItems[i].minimumLevel)) {
            lowItems.push(allItems[i]);
        }
    }
    res.send(lowItems);
}));
indexRouter.get("/edit/:itemIndex", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const itemIndex = req.params.itemIndex;
    const items = yield db.getAllItems();
    res.render("itemDetails", { itemIndex: itemIndex, items: items });
}));
indexRouter.get("/getItemById/:itemId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield db.getItemById(req.params.itemId);
        res.send(item);
    }
    catch (error) {
        console.log("error getting item by Id: ", req.params.itemId, error);
    }
}));
indexRouter.get("/searchLowStock/:itemName", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var nameToSearch = req.params.itemName;
    var items;
    if (nameToSearch == "all") {
        items = yield db.getAllLowStockItems();
    }
    else {
        items = yield db.searchForLowStockItem(req.params.itemName);
    }
    res.send(items);
}));
indexRouter.get("/search/:itemName", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var nameToSearch = req.params.itemName;
    var items;
    if (nameToSearch == "all") {
        items = yield db.getAllItems();
    }
    else {
        items = yield db.searchForItem(req.params.itemName);
    }
    res.send(items);
}));
indexRouter.post("/edit/:itemIndex", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('update');
    const itemIndex = Number(req.params.itemIndex);
    const value = Number(req.body.itemQuantity) * Number(req.body.itemPrice);
    const oldItem = yield db.getItemById(req.params.itemIndex);
    let stockOrdered = oldItem[0].stockOrdered;
    if (stockOrdered == null)
        stockOrdered = false;
    // Log activity if quantity has changed
    if (oldItem[0].quantity != req.body.itemQuantity) {
        console.log('sldkfjsldfkjsldkjfkl');
        yield db.logActivity('quantity', String(itemIndex), oldItem[0].name, String(oldItem[0].quantity), String(req.body.itemQuantity));
        const oldQuantity = oldItem[0].quantity;
        const newQuantity = req.body.itemQuantity;
    }
    // Reset stock ordered status if quantity is about minimum level
    if (req.body.itemQuantity > req.body.itemMinQuantity) {
        stockOrdered = false;
    }
    yield db.updateItem(itemIndex, req.body.itemName, req.body.itemQuantity, req.body.itemMinQuantity, req.body.itemPrice, value, req.body.itemBarcode, req.body.itemNotes, req.body.itemTags, stockOrdered);
    res.send();
}));
indexRouter.post("/updateItemOrderedStatus", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield db.updateItemOrderedStatus(req.body.itemId, req.body.stockOrdered);
    res.send();
}));
indexRouter.post("/addItem", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield db.addItem(req.body.itemName, req.body.itemQuantity, req.body.itemMinQuantity, req.body.itemPrice, req.body.itemValue, req.body.itemBarcode, req.body.itemNotes, req.body.itemTags);
    res.send();
}));
indexRouter.post("/deleteItem", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('deleting', req.body.itemss);
    yield db.deleteItem(req.body.itemId);
    res.send();
}));
indexRouter.post("/deleteArrayOfItems", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('trying');
    yield db.deleteArrayOfItems(req.body.items);
    res.send();
}));
indexRouter.post("/uploadCSV", (req, res) => {
    console.log('Parsing... ');
    try {
        const data = papa.parse(req.body.csvData, {
            header: true,
            dynamicTyping: true,
            complete: function (results) {
                console.log('Parsed csv data: ');
                for (let i = 1; i < results.data.length; i++) {
                    console.log(results.data[i]['Entry Name'], results.data[i]['Quantity'], results.data[i]['Min Level'], results.data[i]['Price'], results.data[i]['Value'], results.data[i]['Notes'], results.data[i]['Tags'], results.data[i]['Barcode/QR2-Data']);
                    db.addItem(results.data[i]['Entry Name'], results.data[i]['Quantity'], results.data[i]['Min Level'], results.data[i]['Price'], results.data[i]['Value'], results.data[i]['Barcode/QR2-Data'], results.data[i]['Notes'], results.data[i]['Tags']);
                }
            }
        });
    }
    catch (_a) {
        console.log('Failed to upload csv');
        throw new Error('Missing required parameter!'); // Express will catch this
    }
    res.redirect("/");
});
indexRouter.get("/downloadCSV", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Parsing... ');
    try {
        const config = { delelimiter: "," };
        const rows = yield db.getAllItems();
        const data = papa.unparse(rows, config);
        console.log(data);
        res.send(data);
    }
    catch (_a) {
        console.log('Failed to download csv');
        throw new Error('Error downlaoding csv'); // Express will catch this
    }
    res.redirect("/");
}));
indexRouter.post("/new", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`post ${req.body.name}`);
    const item = req.body;
    yield db.addItem(item.itemName, item.quantity, item.minLevel, item.price);
    res.redirect("/");
}));
indexRouter.get("/getTableMetaData", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield db.calculateItemsMetaData();
}));
indexRouter.post('/deleteAllItems', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield db.backupItemsTable();
    yield db.deleteAllItems();
    yield db.logActivity('delete all', null, null, null, null);
    res.redirect("/");
}));
indexRouter.post('/logActivity', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield db.logActivity(req.body.type, req.body.itemId, req.body.oldValue, req.body.newValue);
    res.redirect("/");
}));
indexRouter.get('/getActivityLog', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const rows = yield db.getActivityLog();
    res.send(rows);
}));
indexRouter.get("/undoCommand", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activtyLog = yield db.getActivityLog();
        const log = activtyLog[0];
        switch (log.type) {
            case 'quantity':
                undoQuantityChange(log.itemId, log.oldValue, log.newValue);
                break;
            case 'delete all':
                console.log('undo delete all');
                undoDeleteAll();
                break;
        }
        yield db.removeActivityLogById(log.id);
    }
    catch (error) {
        res.send('Error trying to undo: ', error);
    }
    res.send('Undo successful');
}));
function undoQuantityChange(itemId, oldQuantity, newQuantity) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get item
        const item = (yield db.getItemById(itemId))[0];
        const value = Number(oldQuantity) * Number(item.price);
        const quantityChange = newQuantity - oldQuantity;
        const newValue = Number(item.quantity) - quantityChange;
        let stockOrdered = item.stockOrdered;
        if (stockOrdered == null)
            stockOrdered = false;
        // Reset stock ordered status if quantity is about minimum level
        if (item.quantity > item.minimumLevel) {
            stockOrdered = false;
        }
        yield db.updateItem(itemId, item.name, newValue, item.minimumLevel, item.price, value, item.barcode, item.notes, item.tags, stockOrdered);
    });
}
function undoDeleteAll() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.overwriteItemsTableWithBackup();
    });
}
exports.default = indexRouter;
//# sourceMappingURL=indexRouter.js.map