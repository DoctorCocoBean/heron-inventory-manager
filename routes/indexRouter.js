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
indexRouter.get("/items", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('loading page');
    const items = yield db.getAllItems();
    var metaData = yield db.calculateItemsMetaData();
    metaData.totalValue = convertNumToString(metaData.totalValue);
    res.render("items", { items: items, metaData: metaData });
}));
indexRouter.get("/api/items", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('loading items');
    const items = yield db.getAllItems();
    res.send(items);
}));
indexRouter.delete("/items", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('trying');
    yield db.deleteArrayOfItems(req.body.items);
    res.send();
}));
indexRouter.get("/dashboard", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var metaData = yield db.calculateItemsMetaData();
    metaData.totalValue = convertNumToString(metaData.totalValue);
    res.render("dashboard", { metaData });
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
indexRouter.get("/item/:itemId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield db.getItemById(req.params.itemId);
        res.send(item);
    }
    catch (error) {
        console.log("error getting item by Id: ", req.params.itemId, error);
    }
}));
indexRouter.get("/lowStockitem/:itemName", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
indexRouter.get("/api/itemsByName/:itemName", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
indexRouter.put("/api/item/:itemId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const itemId = Number(req.params.itemId);
    const value = Number(req.body.quantity) * Number(req.body.price);
    const oldItem = yield db.getItemById(req.params.itemId);
    let stockOrdered = oldItem[0].stockOrdered;
    if (stockOrdered == null)
        stockOrdered = false;
    // Log activity if quantity has changed
    if (oldItem[0].quantity != req.body.quantity) {
        yield db.logActivity('quantity', String(itemId), oldItem[0].name, String(oldItem[0].quantity), String(req.body.quantity));
        const oldQuantity = oldItem[0].quantity;
        const newQuantity = req.body.quantity;
    }
    // Reset stock ordered status if quantity is about minimum level
    if (req.body.itemQuantity > req.body.itemMinQuantity) {
        stockOrdered = false;
    }
    yield db.updateItem(itemId, req.body.name, req.body.quantity, req.body.minimumLevel, req.body.price, value, req.body.barcode, req.body.notes, req.body.tags, stockOrdered);
    res.send();
}));
indexRouter.put("/api/item/name", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const itemId = Number(req.body.itemId);
        const item = yield db.getItemById(itemId);
        const oldName = String(item[0].name);
        const newName = String(req.body.name);
        console.log(`Editing is name from ${oldName} to ${newName}`);
        if (oldName != newName) {
            yield db.logActivity('name', String(itemId), oldName, String(oldName), String(newName));
        }
        yield db.updateItem(itemId, newName, item[0].quantity, item[0].minimumLevel, item[0].price, item[0].value, item[0].barcode, item[0].notes, item[0].tags, item[0].stockOrdered);
        res.send();
    }
    catch (error) {
        console.log(`Error changing name. ${error}`);
        console.log(`Stack. ${error.stack}`);
    }
    res.send();
}));
indexRouter.put("/api/item/quantity", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const itemId = Number(req.body.itemId);
        const oldItem = yield db.getItemById(itemId);
        const newQuantity = Number(oldItem[0].quantity) + Number(req.body.quantityChange);
        const value = Number(oldItem[0].price) * newQuantity;
        let stockOrdered = oldItem[0].stockOrdered;
        if (stockOrdered == null)
            stockOrdered = false;
        console.log(`edit amount  is: ${req.body.quantityChange}`);
        // Log activity if quantity has changed
        if (oldItem[0].quantity != newQuantity) {
            yield db.logActivity('quantity', String(itemId), oldItem[0].name, String(oldItem[0].quantity), String(newQuantity));
            console.log(`logging ${oldItem[0].name}`);
        }
        // Reset stock ordered status if quantity is about minimum level
        if (req.body.itemQuantity > req.body.itemMinQuantity) {
            stockOrdered = false;
        }
        yield db.updateItem(itemId, oldItem[0].name, String(newQuantity), oldItem[0].minimumLevel, oldItem[0].price, value, oldItem[0].barcode, oldItem[0].notes, oldItem[0].tags, stockOrdered);
        res.send();
    }
    catch (error) {
        console.log(`Error change quantity. ${error}`);
    }
    res.send();
}));
indexRouter.put("/api/item/minimumLevel", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const itemId = Number(req.body.itemId);
        const item = yield db.getItemById(itemId);
        const oldMinLevel = item[0].minimumLevel;
        const newMinLevel = req.body.minimumLevel;
        console.log(`Editing minimum level from ${oldMinLevel} to ${newMinLevel}`);
        if (oldMinLevel != newMinLevel) {
            yield db.logActivity('Minimum Level', String(itemId), item[0].name, String(oldMinLevel), String(newMinLevel));
        }
        yield db.updateItem(itemId, item[0].name, item[0].quantity, newMinLevel, item[0].price, item[0].value, item[0].barcode, item[0].notes, item[0].tags, item[0].stockOrdered);
        res.send();
    }
    catch (error) {
        console.log(`Error changing minimum level. ${error}`);
        console.log(`Stack. ${error.stack}`);
    }
    res.send();
}));
indexRouter.put("/api/item/price", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const itemId = Number(req.body.itemId);
        const item = yield db.getItemById(itemId);
        const oldPrice = item[0].price;
        const newPrice = req.body.price;
        const value = Number(newPrice) * Number(item[0].quantity);
        console.log(`Editing price from ${oldPrice} to ${newPrice}`);
        if (oldPrice != newPrice) {
            yield db.logActivity('price', String(itemId), item[0].name, String(oldPrice), String(newPrice));
        }
        yield db.updateItem(itemId, item[0].name, item[0].quantity, item[0].minimumLevel, newPrice, value, item[0].barcode, item[0].notes, item[0].tags, item[0].stockOrdered);
        res.send();
    }
    catch (error) {
        console.log(`Error changing price. ${error}`);
        console.log(`Stack. ${error.stack}`);
    }
    res.send();
}));
indexRouter.put("/api/item/barcode", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const itemId = Number(req.body.itemId);
        const item = yield db.getItemById(itemId);
        const oldBarcode = item[0].barcode;
        const newBarcode = req.body.barcode;
        console.log(`Editing barcode from ${oldBarcode} to ${newBarcode}`);
        if (oldBarcode != newBarcode) {
            yield db.logActivity('barcode', String(itemId), item[0].name, String(oldBarcode), String(newBarcode));
        }
        yield db.updateItem(itemId, item[0].name, item[0].quantity, item[0].minimumLevel, item[0].price, item[0].value, newBarcode, item[0].notes, item[0].tags, item[0].stockOrdered);
        res.send();
    }
    catch (error) {
        console.log(`Error changing barcode. ${error}`);
        console.log(`Stack. ${error.stack}`);
    }
    res.send();
}));
indexRouter.put("/api/item/notes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const itemId = Number(req.body.itemId);
        const item = yield db.getItemById(itemId);
        const oldNotes = item[0].notes;
        const newNotes = req.body.notes;
        console.log(`Editing notes from ${oldNotes} to ${newNotes}`);
        if (oldNotes != newNotes) {
            yield db.logActivity('notes', String(itemId), item[0].name, String(oldNotes), String(newNotes));
        }
        yield db.updateItem(itemId, item[0].name, item[0].quantity, item[0].minimumLevel, item[0].price, item[0].value, item[0].barcode, newNotes, item[0].tags, item[0].stockOrdered);
        res.send();
    }
    catch (error) {
        console.log(`Error changing notes. ${error}`);
        console.log(`Stack. ${error.stack}`);
    }
    res.send();
}));
indexRouter.put("/itemOrderedStatus", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield db.updateItemOrderedStatus(req.body.itemId, req.body.stockOrdered);
    res.send();
}));
indexRouter.post("api/item", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield db.addItem(req.body.itemName, req.body.itemQuantity, req.body.itemMinQuantity, req.body.itemPrice, req.body.itemValue, req.body.itemBarcode, req.body.itemNotes, req.body.itemTags);
    res.send();
}));
indexRouter.delete("/item", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('deleting', req.body.itemss);
    yield db.deleteItem(req.body.itemId);
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
        let data = papa.unparse(rows, config);
        // Convert column names to be the same as Sortly
        let newlineCharIndex = data.indexOf('\n');
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
    catch (_a) {
        console.log('Failed to download csv');
        throw new Error('Error downlaoding csv'); // Express will catch this
    }
    res.redirect("/");
}));
indexRouter.delete('/allItems', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield db.backupItemsTable();
    yield db.deleteAllItems();
    yield db.logActivity('delete all', null, null, null, null);
    res.redirect("/");
}));
indexRouter.post('/logActivity', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield db.logActivity(req.body.type, req.body.itemId, req.body.oldValue, req.body.newValue);
    res.redirect("/");
}));
indexRouter.get("/activityLog", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("activityLog", {});
}));
indexRouter.get('/api/activityLog', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
indexRouter.get("/api/itemsMetaData", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('getting meta data');
    var metaData = yield db.calculateItemsMetaData();
    res.send(metaData);
}));
function undoDeleteAll() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.overwriteItemsTableWithBackup();
    });
}
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
exports.default = indexRouter;
//# sourceMappingURL=indexRouter.js.map