import { Router }  from 'express';
const indexRouter = Router();
import * as papa from 'papaparse';
import * as db from '../pool/queries';
import * as passport from 'passport';
import * as bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import * as jwt from 'jsonwebtoken';


declare global {
  namespace Express 
  {
    interface User {
        id: number;
        username: string;
        password: string;
    }
    interface Request {
      user?: User;
      userid?: number;
      token: string;
    }
    interface Request {
      logout(callback: (err: any) => void): void;
      login(user: any, callback?: (err: any) => void): void;
    }
  }
}

// Middleware to ensure user is authenticated via session
function ensureAuthenticated(req, res, next) 
{
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

// Home page
indexRouter.get("/", ensureAuthenticated, async (req, res) => 
{
    res.redirect("/items");
});

// Login page
indexRouter.get("/login", async (req, res) => 
{
    res.render("loginForm");
});

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
indexRouter.post("/signup", async (req, res) => 
{
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await db.addUser(req.body.username, hashedPassword);
        res.json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error signing up:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Login endpoint
indexRouter.post("/login", 
    passport.authenticate('local', {
        successRedirect: '/items',
        failureRedirect: '/login'
    })
);

// Middleware to extract and verify JWT token from authorization header
function verifyToken(req, res, next) 
{
    const bearerHeader  = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.status(403).json({ message: "No token provided" });
    }
}

// API Login endpoint
indexRouter.post("/api/login", passport.authenticate('local', {
    session: false
}), (req, res) => {
    console.log('attempting api login');

    const user = req.user as Express.User;
    console.log(`id ${user.id} username: ${user.username}`);
    
    const token = jwt.sign({ id: user.id, username: user.username }, 'secret', { expiresIn: '1h' });
    res.json({ token });
});

// Get guest login
indexRouter.get("/guest-login", async (req, res, next) => 
{
    try {
        console.log('logging guest');
        
        const guestUser = { id: 27 }; // 27 is the id guest user in db
        req.login(guestUser, (err) => {
            if (err) { return next(err); }
            res.redirect('/');
        });

    } catch (error) {
        console.error("Error during guest login:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Get user ID
indexRouter.get("/api/userid", ensureAuthenticated, async (req, res) => 
{
    if (req.user && req.user.id) {
        res.json({ userid: req.user.id });
    } else {
        res.status(404).json({ message: "User ID not found" });
    }
});

// Dashboard page
indexRouter.get("/dashboard", ensureAuthenticated, async (req, res) => 
{
    let username = req.user ? req.user.username : "Guest";
    var metaData            = await db.calculateItemsMetaData(userIdFromRequest(req));
        metaData.totalValue = metaData.totalValue;
    res.render("dashboard", { metaData, user: username });
});

// Low stock page
indexRouter.get("/lowstock", ensureAuthenticated, async (req, res) => 
{
    let username = req.user ? req.user.username : "Guest";
    res.render("lowstock", { user: username });
});

// Transaction report page
indexRouter.get("/transactionReport", ensureAuthenticated, async (req, res) => 
{
    let username = req.user ? req.user.username : "Guest";
    res.render("transactionReport", { user: username });
});

// Get low stock items
indexRouter.get("/api/lowStockItems", verifyToken, async (req, res) => 
{
    let userid = await getUserIdFromToken(req.token);
    const allItems = await db.getAllItems(userid);
    var metaData = await db.calculateItemsMetaData(userid);
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

// Get low stock items by name
indexRouter.get("/api/lowStockItems/:itemName", verifyToken, async (req, res) => 
{
    let userid = await getUserIdFromToken(req.token);
    var nameToSearch = req.params.itemName;
    var items;

    console.log("Searching for low stock items. Name:", nameToSearch, "User ID:", userid);

    if (nameToSearch == undefined || nameToSearch == "all") {
        items = await db.getAllLowStockItems(userid);
    }
    else {
        items = await db.searchForLowStockItem(userid, req.params.itemName);
    }

    res.send(items);
});

// Get items page
indexRouter.get("/items", ensureAuthenticated, async (req, res, next) => 
{
    try 
    {
        let username = req.user ? req.user.username : "Guest";
        const userid = userIdFromRequest(req)
        
        var metaData            = await db.calculateItemsMetaData(userid);
            metaData.totalValue = metaData.totalValue;

            res.render("items", { user: username, metaData: metaData });
    } catch (error) {
        console.error("Error loading items page:", error);
        next(new Error("Error loading items page: " + error.message));
    }
});

// Delete multiple items
indexRouter.delete("/api/items", verifyToken,  async (req, res) =>
{
    let userid = await getUserIdFromToken(req.token);
    await db.deleteArrayOfItems(userid, req.body.items);
    res.send();
});

// Get all items
indexRouter.get("/api/items", verifyToken, async (req, res, next) => 
{
    let userid;
    userid = await getUserIdFromToken(req.token);
    console.log('user id is ', userid);
    // await getUserIdFromToken(req.token).then((id: number) => {
    //     userid = id;
    // });
    console.log('user id is ', userid);

    try {

        const items = await db.getAllItems(userid);
        res.send(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        next(new Error('Error fetching items' + error.message));
    }
});

// Get item by row id
indexRouter.get("/api/item/:itemId", async (req, res) => 
{
    try
    {
        const item = await db.getItemByRowId(userIdFromRequest(req), Number(req.params.itemId));
        console.log('getting item with ID:', req.params.itemId );
        console.log('item found:', item);
        res.send(item);
    } 
    catch (error) 
    {
        res.status(500).send({message: "Error getting item by Id"});
        console.log("error getting item by Id: ", req.params.itemId,  error);
    }
});

// Get items by name
indexRouter.get("/api/itemsByName/:itemName", verifyToken, async (req, res, next) => 
{
    let userid = await getUserIdFromToken(req.token);
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

indexRouter.put("/api/item", verifyToken, async (req, res) =>
{
    let userid = await getUserIdFromToken(req.token);
    const itemId  = Number(req.body.id);
    const value   = Number(req.body.quantity) * Number(req.body.price);
    const oldItem = await db.getItemByRowId(userid, itemId);

    let stockOrdered = oldItem[0].stockOrdered;
    if (stockOrdered == null) 
        stockOrdered = false;

    // Log activity if quantity has changed
    if (oldItem[0].quantity != req.body.quantity) 
    {
        await db.logActivity(userid, 'quantity', String(itemId), oldItem[0].name, String(oldItem[0].quantity), String(req.body.quantity));

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

    await db.updateItem(
                        userid,
                        itemId,
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

// Update item name
indexRouter.put("/api/item/name", verifyToken, async (req, res) =>
{
    try {
        let userid = await getUserIdFromToken(req.token);
        const itemId  = Number(req.body.itemId);
        const item = await db.getItemByRowId(userid, itemId);
        const oldName = String(item[0].name);
        const newName = String(req.body.name);

        console.log(`Editing is name from ${oldName} to ${newName}`);
        
        if (oldName != newName) 
        {
            await db.logActivity(userid, 'name', String(itemId), oldName, String(oldName), String(newName));
        }

        await db.updateItem(itemId,
                            userid,
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

// Update item quantity
indexRouter.put("/api/item/quantity", verifyToken, async (req, res) =>
{
    console.log('changing quantity');
    try {
        let userid = await getUserIdFromToken(req.token);
        const itemId  = Number(req.body.itemId);
        const oldItem = await db.getItemByRowId(userid, itemId);
        const newQuantity = Number(oldItem[0].quantity) + Number(req.body.quantityChange);
        const value   = Number(oldItem[0].price) * newQuantity;

        let stockOrdered = oldItem[0].stockOrdered;
        if (stockOrdered == null) 
            stockOrdered = false;

        console.log(`edit amount  is: ${req.body.quantityChange}`);
        
        // Log activity if quantity has changed
        if (oldItem[0].quantity != newQuantity) 
        {
            await db.logActivity(userid, 'quantity', String(itemId), oldItem[0].name, String(oldItem[0].quantity), String(newQuantity));
            console.log(`logging ${oldItem[0].name}`);
        }

        // Reset stock ordered status if quantity is about minimum level
        if (req.body.itemQuantity > req.body.itemMinQuantity) {
            stockOrdered = false;    
        }

        await db.updateItem(
                            userid,    
                            itemId,
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

// Update item minimum level
indexRouter.put("/api/item/minimumLevel", verifyToken, async (req, res) =>
{
    try {
        let userid = await getUserIdFromToken(req.token);
        const itemId  = Number(req.body.itemId);
        const item = await db.getItemByRowId(userid, itemId);
        const oldMinLevel = item[0].minimumLevel;
        const newMinLevel = req.body.minimumLevel;

        console.log(`Editing minimum level from ${oldMinLevel} to ${newMinLevel}`);
        
        if (oldMinLevel != newMinLevel) 
        {
            await db.logActivity(userid, 'Minimum Level', String(itemId), item[0].name, String(oldMinLevel), String(newMinLevel));
        }

        await db.updateItem(
                            userid,
                            itemId,
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

// Update item price
indexRouter.put("/api/item/price", verifyToken, async (req, res) =>
{
    try {
        let userid = await getUserIdFromToken(req.token);
        const itemId  = Number(req.body.itemId);
        const item = await db.getItemByRowId(userid, itemId);
        const oldPrice = item[0].price;
        const newPrice = req.body.price;
        const value = Number(newPrice) * Number(item[0].quantity);

        console.log(`Editing price from ${oldPrice} to ${newPrice}`);
        
        if (oldPrice != newPrice) 
        {
            await db.logActivity(userid, 'price', String(itemId), item[0].name, String(oldPrice), String(newPrice));
        }

        await db.updateItem(
                            userid,
                            itemId,
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

// Update item barcode
indexRouter.put("/api/item/barcode", verifyToken, async (req, res) =>
{
    try {
        let userid = await getUserIdFromToken(req.token);
        const itemId = Number(req.body.itemId);
        const item = await db.getItemByRowId(userid, itemId);
        const oldBarcode = item[0].barcode;
        const newBarcode = req.body.barcode;

        console.log(`Editing barcode from ${oldBarcode} to ${newBarcode}`);
        
        if (oldBarcode != newBarcode) 
        {
            await db.logActivity(userid, 'barcode', String(itemId), item[0].name, String(oldBarcode), String(newBarcode));
        }

        await db.updateItem(
                            userid,
                            itemId,
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

// Update item notes
indexRouter.put("/api/item/notes", verifyToken, async (req, res) =>
{
    try {
        let userid = await getUserIdFromToken(req.token);
        const itemId = Number(req.body.itemId);
        const item = await db.getItemByRowId(userid, itemId);
        const oldNotes = item[0].notes;
        const newNotes = req.body.notes;

        console.log(`Editing notes from ${oldNotes} to ${newNotes}`);
        
        if (oldNotes != newNotes) 
        {
            await db.logActivity(userid, 'notes', String(itemId), item[0].name, String(oldNotes), String(newNotes));
        }

        await db.updateItem(
                            userid,
                            itemId,
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

// Add new item
indexRouter.post("/api/item", [
        body('quantity').isInt().withMessage("Quantity must be an integer."),
        body('minimumLevel').isInt().withMessage("Minimum level must be an integer."),
        body('price').isFloat().withMessage("Price must be a number."),
], verifyToken, async (req, res, next) =>
{
    try {
        let userid = await getUserIdFromToken(req.token);
        const errors = validationResult(req);   
        if (!errors.isEmpty()) {
            return res.status(400).send({ message: `Invalid input - ${errors.array()[0].msg}` });
        }

        if (userid == undefined) {
            return res.status(400).send({ message: "User ID is required." });
        }

        const value = Number(req.body.price) * Number(req.body.quantity);
        await db.addItem(
                            userid,
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
    }
});

// Delete single item
indexRouter.delete("/api/item", verifyToken, async (req, res) =>
{
	console.log('deleting', req.body.items);
    let userid = await getUserIdFromToken(req.token);
    await db.deleteItem(userid, req.body.itemId);
    res.send();
});

// Update item status
indexRouter.put("/api/itemOrderedStatus", verifyToken, async (req, res) =>
{
    let userid = await getUserIdFromToken(req.token);
    await db.updateItemOrderedStatus(userid, req.body.itemId, req.body.stockOrdered);
    res.send();
});

// Upload CSV file and add items. Format is the same as Sortly export.
indexRouter.post("/uploadCSV", verifyToken, async (req, res) => 
{
    console.log('Parsing... ');
    try 
    {
        if (!req.body.csvData) {
            throw new Error('Missing required parameter: csvData');
        }
        
        let userid = await getUserIdFromToken(req.token);
        const data = papa.parse(req.body.csvData, 
        { 
            header: true,
            dynamicTyping: true,
            complete: function(results) 
            {
                console.log('Parsed csv data: ');
                for (let i = 1; i<results.data.length; i++) {
                        db.addItem(
                                        userid,
                                        results.data[i]['Entry Name'],
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

// Dowload items as csv
indexRouter.get("/downloadCSV", verifyToken, async (req, res) => 
{
    console.log('Parsing... ');
    
    try {
        const config = { delimiter: "," }
        let userid = await getUserIdFromToken(req.token);
        const rows = await db.getAllItems(userid);
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

// Delete all items
indexRouter.delete('/allItems', verifyToken, async (req, res, next) =>
{
    try 
    {
        const userid = await getUserIdFromToken(req.token);
        await db.backupItemsTable(userid);
        await db.deleteAllItems(userid);
        await db.logActivity(userid, 'delete all', null, null, null, null);
        res.send();
    } catch (error) {
        console.log(`Error deleting all items: ${error}`);
        next(new Error(`Error deleting all items: ${error}`));
    }
});

// Add new activity log
indexRouter.post('/logActivity', verifyToken, async (req, res) =>
{
    const userid = await getUserIdFromToken(req.token);
    await db.logActivity(userid, req.body.type, req.body.itemId, req.body.name, req.body.oldValue, req.body.newValue);
    res.send();
});

// Get activity log page
indexRouter.get("/activityLog", ensureAuthenticated, async (req, res) => 
{
    let username = req.user ? req.user.username : "Guest";
    res.render("activityLog", { user: username, userid: userIdFromRequest(req) });
});

// Get activity log for the authenticated user
indexRouter.get('/api/activityLog', verifyToken, async (req, res) =>
{
    const userid = await getUserIdFromToken(req.token);
    const rows = await db.getActivityLog(userid);
    res.send(rows)
});

// Undo the last activity command
indexRouter.post("/undoCommand", async (req, res) =>
{
    try {
        const activtyLog = await db.getActivityLog(userIdFromRequest(req));
        const log = activtyLog[0];

        console.log('Undoing action:', log);
        
        switch (log.type) 
        {
            case 'quantity':
                await undoQuantityChange(userIdFromRequest(req), log.itemId, log.oldValue, log.newValue);
                break;
            case 'delete all':
                console.log('undo delete all');
                await undoDeleteAll(userIdFromRequest(req));
                break;
        }

        await db.removeActivityLogById(log.id);
    } catch (error) {
        res.send('Error trying to undo: ' + error)
    }

     res.send('Undo successful');
});

// Undo a quantity change operation
async function undoQuantityChange(userId, itemId, oldQuantity, newQuantity)
{
    // Get item
    const item = (await db.getItemByRowId(userId, itemId))[0];
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

    await db.updateItem(
                        userId,     
                        itemId,
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
    var metaData = await db.calculateItemsMetaData(userIdFromRequest(req));
    res.send(metaData);
});

// Restore all items from backup table
async function undoDeleteAll(userid)
{
    await db.overwriteItemsTableWithBackup(userid);
}

// Convert a number string to a formatted string with commas
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

// Get user ID from request object, defaulting to 1 if not authenticated
function userIdFromRequest(req: any) : number
{
    return req.user ? req.user.id : 1;
}

async function getUserIdFromToken(token: string)
{
    return new Promise((resolve, reject) => {
        jwt.verify(token, 'secret', (error, authData) => {
            if (error) {
                reject(new Error('Could not get user id from token'));
            } else if (typeof authData !== 'string' && authData.id) {
                resolve(authData.id);
            } else {
                reject(new Error('Invalid token payload'));
            }
        });
    });
}

export default indexRouter;