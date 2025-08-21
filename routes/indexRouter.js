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
const db = require("../pool/queries"); // For typescript
// import db from '../pool/queries';
const passport = require("passport");
const bcrypt = require("bcryptjs");
const express_validator_1 = require("express-validator");
function ensureAuthenticated(req, res, next) {
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
indexRouter.get("/", ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('home');
    res.redirect("/items");
}));
indexRouter.get("/sign-up", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('sign up page loading');
    res.render("signupForm");
}));
indexRouter.get('/log-out', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/sign-up");
    });
});
indexRouter.post("/sign-up", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hashedPassword = yield bcrypt.hash(req.body.password, 10);
        yield db.addUser(req.body.username, hashedPassword);
        console.log('redreisdlfsdlkf');
        // res.redirect("/");
        res.json({ message: "User registered successfully" });
    }
    catch (error) {
        console.error("Error signing up:", error);
        res.status(500).send("Internal Server Error");
    }
}));
indexRouter.post("/log-in", passport.authenticate('local', {
    successRedirect: '/items',
    failureRedirect: '/sign-up'
}));
indexRouter.get("/api/userid", ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user && req.user.id) {
        res.json({ userid: req.user.id });
    }
    else {
        res.status(404).json({ message: "User ID not found" });
    }
}));
indexRouter.get("/dashboard", ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let username = req.user ? req.user.username : "Guest";
    var metaData = yield db.calculateItemsMetaData();
    metaData.totalValue = metaData.totalValue;
    res.render("dashboard", { metaData, user: username });
}));
indexRouter.get("/lowstock", ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let username = req.user ? req.user.username : "Guest";
    res.render("lowstock", { user: username });
}));
indexRouter.get("/transactionReport", ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let username = req.user ? req.user.username : "Guest";
    res.render("transactionReport", { user: username });
}));
indexRouter.get("/api/lowStockItems", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allItems = yield db.getAllItems(userId(req));
    var metaData = yield db.calculateItemsMetaData(userId(req));
    var lowItems = [];
    // Calculate low stock here
    for (let i = 0; i < allItems.length; i++) {
        if (Number(allItems[i].quantity) < Number(allItems[i].minimumLevel)) {
            lowItems.push(allItems[i]);
        }
    }
    res.send(lowItems);
}));
indexRouter.get("/api/lowStockitem/:itemName", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var nameToSearch = req.params.itemName;
    var items;
    console.log("Searching for low stock items. Name:", nameToSearch, "User ID:", userId(req));
    if (nameToSearch == undefined || nameToSearch == "all") {
        items = yield db.getAllLowStockItems(userId(req));
    }
    else {
        items = yield db.searchForLowStockItem(userId(req), req.params.itemName);
    }
    res.send(items);
}));
indexRouter.get("/items", ensureAuthenticated, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let username = req.user ? req.user.username : "Guest";
        const userid = userId(req);
        var metaData = yield db.calculateItemsMetaData(userid);
        metaData.totalValue = metaData.totalValue;
        res.render("items", { user: username, metaData: metaData });
    }
    catch (error) {
        console.error("Error loading items page:", error);
        next(new Error("Error loading items page: " + error.message));
    }
}));
indexRouter.delete("/api/items", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield db.deleteArrayOfItems(userId(req), req.body.items);
    res.send();
}));
indexRouter.get("/api/items", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('loading items');
        console.log('user is ', req.user ? req.user.username : "Guest");
        console.log('userid ', req.user.id);
        const items = yield db.getAllItems();
        res.send(items);
    }
    catch (error) {
        console.error('Error fetching items:', error);
        next(new Error('Error fetching items' + error.message));
    }
}));
indexRouter.get("/api/item/:itemId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield db.getItemByRowId(userId(req), Number(req.params.itemId));
        res.send(item);
    }
    catch (error) {
        res.status(500).send({ message: "Error getting item by Id" });
        console.log("error getting item by Id: ", req.params.itemId, error);
    }
}));
indexRouter.get("/api/itemsByName/:itemName", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('user is ', req.user ? req.user.username : "Guest");
    console.log('userid ', req.user ? req.user.id : 'no id');
    const userid = req.user ? req.user.id : 1;
    var nameToSearch = req.params.itemName;
    var items;
    if (nameToSearch == "all") {
        items = yield db.getAllItems(userid);
    }
    else {
        items = yield db.searchForItem(userid, req.params.itemName);
    }
    res.send(items);
}));
indexRouter.put("/api/item", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('updating item 2');
    const itemId = Number(req.body.id);
    const value = Number(req.body.quantity) * Number(req.body.price);
    const oldItem = yield db.getItemByRowId(userId(req), itemId);
    let stockOrdered = oldItem[0].stockOrdered;
    if (stockOrdered == null)
        stockOrdered = false;
    // Log activity if quantity has changed
    if (oldItem[0].quantity != req.body.quantity) {
        yield db.logActivity(userId(req), 'quantity', String(itemId), oldItem[0].name, String(oldItem[0].quantity), String(req.body.quantity));
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
        res.status(500).json({ message: "Barcode already exists for another item." });
        return;
    }
    yield db.updateItem(userId(req), itemId, req.body.name, req.body.quantity, req.body.minimumLevel, req.body.price, value, req.body.barcode, req.body.notes, req.body.tags, stockOrdered);
    res.send();
}));
indexRouter.put("/api/item/name", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const itemId = Number(req.body.itemId);
        const item = yield db.getItemByRowId(userId(req), itemId);
        const oldName = String(item[0].name);
        const newName = String(req.body.name);
        console.log(`Editing is name from ${oldName} to ${newName}`);
        if (oldName != newName) {
            yield db.logActivity('name', String(itemId), oldName, String(oldName), String(newName));
        }
        yield db.updateItem(itemId, userId(req), newName, item[0].quantity, item[0].minimumLevel, item[0].price, item[0].value, item[0].barcode, item[0].notes, item[0].tags, item[0].stockOrdered);
        res.send();
    }
    catch (error) {
        console.log(`Error changing name. ${error}`);
        console.log(`Stack. ${error.stack}`);
    }
    res.send();
}));
indexRouter.put("/api/item/quantity", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('changing quantity');
    try {
        const itemId = Number(req.body.itemId);
        const oldItem = yield db.getItemByRowId(userId(req), itemId);
        const newQuantity = Number(oldItem[0].quantity) + Number(req.body.quantityChange);
        const value = Number(oldItem[0].price) * newQuantity;
        let stockOrdered = oldItem[0].stockOrdered;
        if (stockOrdered == null)
            stockOrdered = false;
        console.log(`edit amount  is: ${req.body.quantityChange}`);
        // Log activity if quantity has changed
        if (oldItem[0].quantity != newQuantity) {
            yield db.logActivity(userId(req), 'quantity', String(itemId), oldItem[0].name, String(oldItem[0].quantity), String(newQuantity));
            console.log(`logging ${oldItem[0].name}`);
        }
        // Reset stock ordered status if quantity is about minimum level
        if (req.body.itemQuantity > req.body.itemMinQuantity) {
            stockOrdered = false;
        }
        yield db.updateItem(userId(req), itemId, oldItem[0].name, String(newQuantity), oldItem[0].minimumLevel, oldItem[0].price, value, oldItem[0].barcode, oldItem[0].notes, oldItem[0].tags, stockOrdered);
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
        const item = yield db.getItemByRowId(userId(req), itemId);
        const oldMinLevel = item[0].minimumLevel;
        const newMinLevel = req.body.minimumLevel;
        console.log(`Editing minimum level from ${oldMinLevel} to ${newMinLevel}`);
        if (oldMinLevel != newMinLevel) {
            yield db.logActivity(userId(req), 'Minimum Level', String(itemId), item[0].name, String(oldMinLevel), String(newMinLevel));
        }
        yield db.updateItem(userId(req), itemId, item[0].name, item[0].quantity, newMinLevel, item[0].price, item[0].value, item[0].barcode, item[0].notes, item[0].tags, item[0].stockOrdered);
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
        const item = yield db.getItemByRowId(userId(req), itemId);
        const oldPrice = item[0].price;
        const newPrice = req.body.price;
        const value = Number(newPrice) * Number(item[0].quantity);
        console.log(`Editing price from ${oldPrice} to ${newPrice}`);
        if (oldPrice != newPrice) {
            yield db.logActivity(userId(req), 'price', String(itemId), item[0].name, String(oldPrice), String(newPrice));
        }
        yield db.updateItem(userId(req), itemId, item[0].name, item[0].quantity, item[0].minimumLevel, newPrice, value, item[0].barcode, item[0].notes, item[0].tags, item[0].stockOrdered);
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
        const item = yield db.getItemByRowId(userId(req), itemId);
        const oldBarcode = item[0].barcode;
        const newBarcode = req.body.barcode;
        console.log(`Editing barcode from ${oldBarcode} to ${newBarcode}`);
        if (oldBarcode != newBarcode) {
            yield db.logActivity(userId(req), 'barcode', String(itemId), item[0].name, String(oldBarcode), String(newBarcode));
        }
        yield db.updateItem(userId(req), itemId, item[0].name, item[0].quantity, item[0].minimumLevel, item[0].price, item[0].value, newBarcode, item[0].notes, item[0].tags, item[0].stockOrdered);
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
        const item = yield db.getItemByRowId(userId(req), itemId);
        const oldNotes = item[0].notes;
        const newNotes = req.body.notes;
        console.log(`Editing notes from ${oldNotes} to ${newNotes}`);
        if (oldNotes != newNotes) {
            yield db.logActivity(userId(req), 'notes', String(itemId), item[0].name, String(oldNotes), String(newNotes));
        }
        yield db.updateItem(userId(req), itemId, item[0].name, item[0].quantity, item[0].minimumLevel, item[0].price, item[0].value, item[0].barcode, newNotes, item[0].tags, item[0].stockOrdered);
        res.send();
    }
    catch (error) {
        console.log(`Error changing notes. ${error}`);
        console.log(`Stack. ${error.stack}`);
    }
    res.send();
}));
indexRouter.post("/api/item", [
    (0, express_validator_1.body)('quantity').isInt().withMessage("Quantity must be an integer."),
    (0, express_validator_1.body)('minimumLevel').isInt().withMessage("Minimum level must be an integer."),
    (0, express_validator_1.body)('price').isFloat().withMessage("Price must be a number."),
], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ message: `Invalid input - ${errors.array()[0].msg}` });
        }
        const userid = req.body.userid;
        if (userid == undefined) {
            return res.status(400).send({ message: "User ID is required." });
        }
        const value = Number(req.body.price) * Number(req.body.quantity);
        yield db.addItem(req.body.userid, req.body.name, req.body.quantity, req.body.minimumLevel, req.body.price, value, req.body.barcode, req.body.notes, req.body.tags);
        res.send();
    }
    catch (error) {
        console.log(`Error adding item. ${error}`);
        console.log(`Stack. ${error.stack}`);
        next(error);
        // return res.status(400).send({ message: `Error adding item ${error}` });
    }
}));
indexRouter.delete("/api/item", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('deleting', req.body.items);
    yield db.deleteItem(userId(req), req.body.itemId);
    res.send();
}));
indexRouter.put("/api/itemOrderedStatus", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield db.updateItemOrderedStatus(userId(req), req.body.itemId, req.body.stockOrdered);
    res.send();
}));
indexRouter.post("/uploadCSV", (req, res) => {
    console.log('Parsing... ');
    try {
        console.log('adding tiem with userid', userId(req));
        const data = papa.parse(req.body.csvData, {
            header: true,
            dynamicTyping: true,
            complete: function (results) {
                console.log('Parsed csv data: ');
                for (let i = 1; i < results.data.length; i++) {
                    db.addItem(userId(req), results.data[i]['Entry Name'], results.data[i]['Quantity'], results.data[i]['Min Level'], results.data[i]['Price'], results.data[i]['Value'], results.data[i]['Barcode/QR2-Data'], results.data[i]['Notes'], results.data[i]['Tags']);
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
indexRouter.delete('/allItems', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userid = userId(req);
        yield db.backupItemsTable(userid);
        yield db.deleteAllItems(userid);
        yield db.logActivity(userid, 'delete all', null, null, null, null);
        res.send();
    }
    catch (error) {
        console.log(`Error deleting all items: ${error}`);
        next(new Error(`Error deleting all items: ${error}`));
    }
}));
indexRouter.post('/logActivity', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield db.logActivity(userId(req), req.body.type, req.body.itemId, req.body.name, req.body.oldValue, req.body.newValue);
    res.redirect("/");
}));
indexRouter.get("/activityLog", ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let username = req.user ? req.user.username : "Guest";
    res.render("activityLog", { user: username, userid: userId(req) });
}));
indexRouter.get('/api/activityLog', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const rows = yield db.getActivityLog(userId(req));
    res.send(rows);
}));
indexRouter.post("/undoCommand", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activtyLog = yield db.getActivityLog(userId(req));
        const log = activtyLog[0];
        console.log('Undoing action:', log);
        switch (log.type) {
            case 'quantity':
                yield undoQuantityChange(userId(req), log.itemId, log.oldValue, log.newValue);
                break;
            case 'delete all':
                console.log('undo delete all');
                yield undoDeleteAll(userId(req));
                break;
        }
        yield db.removeActivityLogById(log.id);
    }
    catch (error) {
        res.send('Error trying to undo: ' + error);
    }
    res.send('Undo successful');
}));
function undoQuantityChange(userId, itemId, oldQuantity, newQuantity) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get item
        const item = (yield db.getItemByRowId(userId, itemId))[0];
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
        yield db.updateItem(userId, itemId, item.name, newValue, item.minimumLevel, item.price, value, item.barcode, item.notes, item.tags, stockOrdered);
    });
}
indexRouter.get("/api/itemsMetaData", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('getting meta data');
    var metaData = yield db.calculateItemsMetaData();
    res.send(metaData);
}));
function undoDeleteAll(userid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.overwriteItemsTableWithBackup(userid);
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
function userId(req) {
    return req.user ? req.user.id : 1;
}
exports.default = indexRouter;
//# sourceMappingURL=indexRouter.js.map