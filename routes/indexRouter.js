"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const indexRouter = (0, express_1.Router)();
const papaparse_1 = __importDefault(require("papaparse"));
const db = __importStar(require("../pool/queries"));
const passport_1 = __importDefault(require("passport"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware to ensure user is authenticated via session
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}
// Home page
indexRouter.get("/", ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.redirect("/items");
}));
// Login page
indexRouter.get("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("loginForm");
}));
// Logout page
indexRouter.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/login");
    });
});
// Sign up endpoint
indexRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hashedPassword = yield bcryptjs_1.default.hash(req.body.password, 10);
        yield db.addUser(req.body.username, hashedPassword);
        res.json({ message: "User registered successfully" });
    }
    catch (error) {
        console.error("Error signing up:", error);
        res.status(500).send("Internal Server Error");
    }
}));
// Login endpoint
indexRouter.post("/login", passport_1.default.authenticate('local', {
    successRedirect: '/items',
    failureRedirect: '/login'
}));
// Middleware to extract and verify JWT token from authorization header
function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    }
    else {
        res.status(403).json({ message: "No token provided" });
    }
}
// API Login endpoint
indexRouter.post("/api/login", passport_1.default.authenticate('local', {
    session: false
}), (req, res) => {
    console.log('attempting api login');
    const user = req.user;
    console.log(`id ${user.id} username: ${user.username}`);
    const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, 'secret', { expiresIn: '1h' });
    res.json({ token });
});
// Get guest login
indexRouter.get("/guest-login", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('logging guest');
        const guestUser = { id: 27 }; // 27 is the id guest user in db
        req.login(guestUser, (err) => {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    }
    catch (error) {
        console.error("Error during guest login:", error);
        res.status(500).send("Internal Server Error");
    }
}));
// Get user ID
indexRouter.get("/api/userid", ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user && req.user.id) {
        res.json({ userid: req.user.id });
    }
    else {
        res.status(404).json({ message: "User ID not found" });
    }
}));
// Dashboard page
indexRouter.get("/dashboard", ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let username = req.user ? req.user.username : "Guest";
    var metaData = yield db.calculateItemsMetaData(userIdFromRequest(req));
    metaData.totalValue = metaData.totalValue;
    res.render("dashboard", { metaData, user: username });
}));
// Low stock page
indexRouter.get("/lowstock", ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let username = req.user ? req.user.username : "Guest";
    res.render("lowstock", { user: username });
}));
// Transaction report page
indexRouter.get("/transactionReport", ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let username = req.user ? req.user.username : "Guest";
    res.render("transactionReport", { user: username });
}));
// Get low stock items
indexRouter.get("/api/lowStockItems", verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userid = yield getUserIdFromToken(req.token);
    const allItems = yield db.getAllItems(userid);
    var metaData = yield db.calculateItemsMetaData(userid);
    var lowItems = [];
    // Calculate low stock here
    for (let i = 0; i < allItems.length; i++) {
        if (Number(allItems[i].quantity) < Number(allItems[i].minimumLevel)) {
            lowItems.push(allItems[i]);
        }
    }
    res.send(lowItems);
}));
// Get low stock items by name
indexRouter.get("/api/lowStockItems/:itemName", verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userid = yield getUserIdFromToken(req.token);
    var nameToSearch = req.params.itemName;
    var items;
    console.log("Searching for low stock items. Name:", nameToSearch, "User ID:", userid);
    if (nameToSearch == undefined || nameToSearch == "all") {
        items = yield db.getAllLowStockItems(userid);
    }
    else {
        items = yield db.searchForLowStockItem(userid, req.params.itemName);
    }
    res.send(items);
}));
// Get items page
indexRouter.get("/items", ensureAuthenticated, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let username = req.user ? req.user.username : "Guest";
        const userid = userIdFromRequest(req);
        var metaData = yield db.calculateItemsMetaData(userid);
        metaData.totalValue = metaData.totalValue;
        res.render("items", { user: username, metaData: metaData });
    }
    catch (error) {
        console.error("Error loading items page:", error);
        next(new Error("Error loading items page: " + error.message));
    }
}));
// Delete multiple items
indexRouter.delete("/api/items", verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userid = yield getUserIdFromToken(req.token);
    yield db.deleteArrayOfItems(userid, req.body.items);
    res.send();
}));
// Get all items
indexRouter.get("/api/items", verifyToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let userid;
    userid = yield getUserIdFromToken(req.token);
    console.log('user id is ', userid);
    // await getUserIdFromToken(req.token).then((id: number) => {
    //     userid = id;
    // });
    console.log('user id is ', userid);
    try {
        const items = yield db.getAllItems(userid);
        res.send(items);
    }
    catch (error) {
        console.error('Error fetching items:', error);
        next(new Error('Error fetching items' + error.message));
    }
}));
// Get item by row id
indexRouter.get("/api/item/:itemId", verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userid = yield getUserIdFromToken(req.token);
        const item = yield db.getItemByRowId(userid, Number(req.params.itemId));
        console.log('getting item with ID:', req.params.itemId);
        console.log('item found:', item);
        res.send(item);
    }
    catch (error) {
        res.status(500).send({ message: "Error getting item by Id" });
        console.log("error getting item by Id: ", req.params.itemId, error);
    }
}));
// Get items by name
indexRouter.get("/api/itemsByName/:itemName", verifyToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let userid = yield getUserIdFromToken(req.token);
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
indexRouter.put("/api/item", verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userid = yield getUserIdFromToken(req.token);
    const itemId = Number(req.body.id);
    const value = Number(req.body.quantity) * Number(req.body.price);
    const oldItem = yield db.getItemByRowId(userid, itemId);
    let stockOrdered = oldItem[0].stockOrdered;
    if (stockOrdered == null)
        stockOrdered = false;
    // Log activity if quantity has changed
    if (oldItem[0].quantity != req.body.quantity) {
        yield db.logActivity(userid, 'quantity', String(itemId), oldItem[0].name, String(oldItem[0].quantity), String(req.body.quantity));
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
    yield db.updateItem(userid, itemId, req.body.name, req.body.quantity, req.body.minimumLevel, req.body.price, value, req.body.barcode, req.body.notes, req.body.tags, stockOrdered);
    res.send();
}));
// Update item name
indexRouter.put("/api/item/name", verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userid = yield getUserIdFromToken(req.token);
        const itemId = Number(req.body.itemId);
        const item = yield db.getItemByRowId(userid, itemId);
        const oldName = String(item[0].name);
        const newName = String(req.body.name);
        console.log(`Editing is name from ${oldName} to ${newName}`);
        if (oldName != newName) {
            yield db.logActivity(userid, 'name', String(itemId), oldName, String(oldName), String(newName));
        }
        yield db.updateItem(itemId, userid, newName, item[0].quantity, item[0].minimumLevel, item[0].price, item[0].value, item[0].barcode, item[0].notes, item[0].tags, item[0].stockOrdered);
        res.send();
    }
    catch (error) {
        console.log(`Error changing name. ${error}`);
        console.log(`Stack. ${error.stack}`);
    }
    res.send();
}));
// Update item quantity
indexRouter.put("/api/item/quantity", verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('changing quantity');
    try {
        let userid = yield getUserIdFromToken(req.token);
        const itemId = Number(req.body.itemId);
        const oldItem = yield db.getItemByRowId(userid, itemId);
        const newQuantity = Number(oldItem[0].quantity) + Number(req.body.quantityChange);
        const value = Number(oldItem[0].price) * newQuantity;
        let stockOrdered = oldItem[0].stockOrdered;
        if (stockOrdered == null)
            stockOrdered = false;
        console.log(`edit amount  is: ${req.body.quantityChange}`);
        // Log activity if quantity has changed
        if (oldItem[0].quantity != newQuantity) {
            yield db.logActivity(userid, 'quantity', String(itemId), oldItem[0].name, String(oldItem[0].quantity), String(newQuantity));
            console.log(`logging ${oldItem[0].name}`);
        }
        // Reset stock ordered status if quantity is about minimum level
        if (req.body.itemQuantity > req.body.itemMinQuantity) {
            stockOrdered = false;
        }
        yield db.updateItem(userid, itemId, oldItem[0].name, String(newQuantity), oldItem[0].minimumLevel, oldItem[0].price, value, oldItem[0].barcode, oldItem[0].notes, oldItem[0].tags, stockOrdered);
        res.send();
    }
    catch (error) {
        console.log(`Error change quantity. ${error}`);
    }
    res.send();
}));
// Update item minimum level
indexRouter.put("/api/item/minimumLevel", verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userid = yield getUserIdFromToken(req.token);
        const itemId = Number(req.body.itemId);
        const item = yield db.getItemByRowId(userid, itemId);
        const oldMinLevel = item[0].minimumLevel;
        const newMinLevel = req.body.minimumLevel;
        console.log(`Editing minimum level from ${oldMinLevel} to ${newMinLevel}`);
        if (oldMinLevel != newMinLevel) {
            yield db.logActivity(userid, 'Minimum Level', String(itemId), item[0].name, String(oldMinLevel), String(newMinLevel));
        }
        yield db.updateItem(userid, itemId, item[0].name, item[0].quantity, newMinLevel, item[0].price, item[0].value, item[0].barcode, item[0].notes, item[0].tags, item[0].stockOrdered);
        res.send();
    }
    catch (error) {
        console.log(`Error changing minimum level. ${error}`);
        console.log(`Stack. ${error.stack}`);
    }
    res.send();
}));
// Update item price
indexRouter.put("/api/item/price", verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userid = yield getUserIdFromToken(req.token);
        const itemId = Number(req.body.itemId);
        const item = yield db.getItemByRowId(userid, itemId);
        const oldPrice = item[0].price;
        const newPrice = req.body.price;
        const value = Number(newPrice) * Number(item[0].quantity);
        console.log(`Editing price from ${oldPrice} to ${newPrice}`);
        if (oldPrice != newPrice) {
            yield db.logActivity(userid, 'price', String(itemId), item[0].name, String(oldPrice), String(newPrice));
        }
        yield db.updateItem(userid, itemId, item[0].name, item[0].quantity, item[0].minimumLevel, newPrice, value, item[0].barcode, item[0].notes, item[0].tags, item[0].stockOrdered);
        res.send();
    }
    catch (error) {
        console.log(`Error changing price. ${error}`);
        console.log(`Stack. ${error.stack}`);
    }
    res.send();
}));
// Update item barcode
indexRouter.put("/api/item/barcode", verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userid = yield getUserIdFromToken(req.token);
        const itemId = Number(req.body.itemId);
        const item = yield db.getItemByRowId(userid, itemId);
        const oldBarcode = item[0].barcode;
        const newBarcode = req.body.barcode;
        console.log(`Editing barcode from ${oldBarcode} to ${newBarcode}`);
        if (oldBarcode != newBarcode) {
            yield db.logActivity(userid, 'barcode', String(itemId), item[0].name, String(oldBarcode), String(newBarcode));
        }
        yield db.updateItem(userid, itemId, item[0].name, item[0].quantity, item[0].minimumLevel, item[0].price, item[0].value, newBarcode, item[0].notes, item[0].tags, item[0].stockOrdered);
        res.send();
    }
    catch (error) {
        console.log(`Error changing barcode. ${error}`);
        console.log(`Stack. ${error.stack}`);
    }
    res.send();
}));
// Update item notes
indexRouter.put("/api/item/notes", verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userid = yield getUserIdFromToken(req.token);
        const itemId = Number(req.body.itemId);
        const item = yield db.getItemByRowId(userid, itemId);
        const oldNotes = item[0].notes;
        const newNotes = req.body.notes;
        console.log(`Editing notes from ${oldNotes} to ${newNotes}`);
        if (oldNotes != newNotes) {
            yield db.logActivity(userid, 'notes', String(itemId), item[0].name, String(oldNotes), String(newNotes));
        }
        yield db.updateItem(userid, itemId, item[0].name, item[0].quantity, item[0].minimumLevel, item[0].price, item[0].value, item[0].barcode, newNotes, item[0].tags, item[0].stockOrdered);
        res.send();
    }
    catch (error) {
        console.log(`Error changing notes. ${error}`);
        console.log(`Stack. ${error.stack}`);
    }
    res.send();
}));
// Add new item
indexRouter.post("/api/item", [
    (0, express_validator_1.body)('quantity').isInt().withMessage("Quantity must be an integer."),
    (0, express_validator_1.body)('minimumLevel').isInt().withMessage("Minimum level must be an integer."),
    (0, express_validator_1.body)('price').isFloat().withMessage("Price must be a number."),
], verifyToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userid = yield getUserIdFromToken(req.token);
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ message: `Invalid input - ${errors.array()[0].msg}` });
        }
        if (userid == undefined) {
            return res.status(400).send({ message: "User ID is required." });
        }
        const value = Number(req.body.price) * Number(req.body.quantity);
        yield db.addItem(userid, req.body.name, req.body.quantity, req.body.minimumLevel, req.body.price, value, req.body.barcode, req.body.notes, req.body.tags);
        res.send();
    }
    catch (error) {
        console.log(`Error adding item. ${error}`);
        console.log(`Stack. ${error.stack}`);
        next(error);
    }
}));
// Delete single item
indexRouter.delete("/api/item", verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('deleting', req.body.items);
    let userid = yield getUserIdFromToken(req.token);
    yield db.deleteItem(userid, req.body.itemId);
    res.send();
}));
// Update item status
indexRouter.put("/api/itemOrderedStatus", verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userid = yield getUserIdFromToken(req.token);
    yield db.updateItemOrderedStatus(userid, req.body.itemId, req.body.stockOrdered);
    res.send();
}));
// Upload CSV file and add items. Format is the same as Sortly export.
indexRouter.post("/uploadCSV", verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Parsing... ');
    try {
        if (!req.body.csvData) {
            throw new Error('Missing required parameter: csvData');
        }
        let userid = yield getUserIdFromToken(req.token);
        const data = papaparse_1.default.parse(req.body.csvData, {
            header: true,
            dynamicTyping: true,
            complete: function (results) {
                console.log('Parsed csv data: ');
                for (let i = 1; i < results.data.length; i++) {
                    db.addItem(userid, results.data[i]['Entry Name'], results.data[i]['Quantity'], results.data[i]['Min Level'], results.data[i]['Price'], results.data[i]['Value'], results.data[i]['Barcode/QR2-Data'], results.data[i]['Notes'], results.data[i]['Tags']);
                }
            }
        });
    }
    catch (_a) {
        console.log('Failed to upload csv');
        throw new Error('Missing required parameter!'); // Express will catch this
    }
    res.redirect("/");
}));
// Dowload items as csv
indexRouter.get("/downloadCSV", verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Parsing... ');
    try {
        const config = { delimiter: "," };
        let userid = yield getUserIdFromToken(req.token);
        const rows = yield db.getAllItems(userid);
        let data = papaparse_1.default.unparse(rows, config);
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
// Delete all items
indexRouter.delete('/allItems', verifyToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userid = yield getUserIdFromToken(req.token);
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
// Add new activity log
indexRouter.post('/logActivity', verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = yield getUserIdFromToken(req.token);
    yield db.logActivity(userid, req.body.type, req.body.itemId, req.body.name, req.body.oldValue, req.body.newValue);
    res.send();
}));
// Get activity log page
indexRouter.get("/activityLog", ensureAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let username = req.user ? req.user.username : "Guest";
    res.render("activityLog", { user: username, userid: userIdFromRequest(req) });
}));
// Get activity log for the authenticated user
indexRouter.get('/api/activityLog', verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = yield getUserIdFromToken(req.token);
    const rows = yield db.getActivityLog(userid);
    res.send(rows);
}));
// Undo the last activity command
indexRouter.post("/undoCommand", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activtyLog = yield db.getActivityLog(userIdFromRequest(req));
        const log = activtyLog[0];
        console.log('Undoing action:', log);
        switch (log.type) {
            case 'quantity':
                yield undoQuantityChange(userIdFromRequest(req), log.itemId, log.oldValue, log.newValue);
                break;
            case 'delete all':
                console.log('undo delete all');
                yield undoDeleteAll(userIdFromRequest(req));
                break;
        }
        yield db.removeActivityLogById(log.id);
    }
    catch (error) {
        res.send('Error trying to undo: ' + error);
    }
    res.send('Undo successful');
}));
// Undo a quantity change operation
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
indexRouter.get("/api/itemsMetaData", verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('getting meta data');
    let userid = yield getUserIdFromToken(req.token);
    var metaData = yield db.calculateItemsMetaData(userid);
    res.send(metaData);
}));
// Restore all items from backup table
function undoDeleteAll(userid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.overwriteItemsTableWithBackup(userid);
    });
}
// Convert a number string to a formatted string with commas
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
// Get user ID from request object, defaulting to 1 if not authenticated
function userIdFromRequest(req) {
    return req.user ? req.user.id : 1;
}
function getUserIdFromToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            jsonwebtoken_1.default.verify(token, 'secret', (error, authData) => {
                if (error) {
                    reject(new Error('Could not get user id from token'));
                }
                else if (typeof authData !== 'string' && authData.id) {
                    resolve(authData.id);
                }
                else {
                    reject(new Error('Invalid token payload'));
                }
            });
        });
    });
}
exports.default = indexRouter;
//# sourceMappingURL=indexRouter.js.map