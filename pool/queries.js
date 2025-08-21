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
exports.getAllItems = getAllItems;
exports.getAllLowStockItems = getAllLowStockItems;
exports.getItemByRowId = getItemByRowId;
exports.sanitizeApostrophe = sanitizeApostrophe;
exports.addItem = addItem;
exports.deleteItem = deleteItem;
exports.deleteArrayOfItems = deleteArrayOfItems;
exports.updateItemOrderedStatus = updateItemOrderedStatus;
exports.updateItem = updateItem;
exports.searchForItem = searchForItem;
exports.searchForLowStockItem = searchForLowStockItem;
exports.deleteAllItems = deleteAllItems;
exports.backupItemsTable = backupItemsTable;
exports.overwriteItemsTableWithBackup = overwriteItemsTableWithBackup;
exports.calculateItemsMetaData = calculateItemsMetaData;
exports.logActivity = logActivity;
exports.removeActivityLogById = removeActivityLogById;
exports.getActivityLog = getActivityLog;
exports.addUser = addUser;
exports.getUserByUsername = getUserByUsername;
exports.getUserById = getUserById;
// const pool = require("./pool");
const pool = require("./pool").default;
function getAllItems(userid) {
    return __awaiter(this, void 0, void 0, function* () {
        const { rows } = yield pool.query(`SELECT * FROM items WHERE userid = ${userid} ORDER BY name ASC `);
        return rows;
    });
}
function getAllLowStockItems(userid) {
    return __awaiter(this, void 0, void 0, function* () {
        const { rows } = yield pool.query(`SELECT * FROM items WHERE userid = ${userid} ORDER BY id ASC`);
        let lowStockItems = [];
        for (let i = 0; i < rows.length; i++) {
            if (Number(rows[i].quantity) < Number(rows[i].minimumLevel)) {
                lowStockItems.push(rows[i]);
            }
        }
        return lowStockItems;
    });
}
function getItemByRowId(userId, rowId) {
    return __awaiter(this, void 0, void 0, function* () {
        const { rows } = yield pool.query(`SELECT * FROM items
         WHERE "id" = $1
         AND "userid" = $2`, [rowId, userId]);
        return rows;
    });
}
function sanitizeApostrophe(inputString) {
    if (inputString.includes('\'')) {
        const index = inputString.indexOf('\'');
        const apostrophe = '\'';
        const firstHalf = inputString.substring(0, index);
        const secondHalf = inputString.substring(index, inputString.length);
        const newString = firstHalf + apostrophe + secondHalf;
        return newString;
    }
    else {
        return inputString;
    }
}
function addItem(userid, name, quantity, minLevel, price, value, barcode, notes, tags) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("inserting item: ", name, "for user:", userid);
        if (!name) {
            name = "null";
            return;
        }
        else {
            if (name.includes('\'')) {
                name = sanitizeApostrophe(name);
            }
        }
        if (!quantity) {
            quantity = 0;
        }
        if (!minLevel) {
            minLevel = 0;
        }
        if (!price) {
            price = 0;
        }
        if (!value) {
            value = 0;
        }
        if (!barcode) {
            barcode = 0;
        }
        if (!notes) {
            notes = "";
        }
        if (!tags) {
            tags = "";
        }
        const SQL = `
        INSERT INTO items (name, quantity, "minimumLevel", price, value, barcode, notes, tags, userid)
        VALUES ('${name}', '${quantity}', '${minLevel}', '${price}', '${value}', '${barcode}', '${notes}', '${tags}', '${userid}');
    `;
        try {
            yield pool.query(SQL);
        }
        catch (err) {
            throw new Error(`${err}: couldnt add item. SQL: ${SQL}`);
        }
    });
}
function deleteItem(userId, itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        const SQL = `
        DELETE FROM items WHERE id = ${itemId} AND userid = ${userId};
    `;
        yield pool.query(SQL);
    });
}
function deleteArrayOfItems(userId, items) {
    return __awaiter(this, void 0, void 0, function* () {
        let SQL;
        for (let i = 0; i < items.length; i++) {
            console.log('deleting', items[i]);
            const SQL = `
            DELETE FROM items WHERE id = ${items[i]};
        `;
            yield pool.query(SQL);
        }
    });
}
function updateItemOrderedStatus(userid, itemId, stockOrdered) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const SQL = `
            UPDATE items
            SET "stockOrdered" = ${stockOrdered}
            WHERE id = ${itemId} AND userid = ${userid};
        `;
            yield pool.query(SQL);
        }
        catch (error) {
            console.log('Error trying to update stock ordered status: ', error);
        }
    });
}
function updateItem(userId, rowId, name, itemQuantity, itemMinQuantity, itemPrice, itemValue, itemBarcode, itemNotes, itemTags, stockOrdered) {
    return __awaiter(this, void 0, void 0, function* () {
        if (itemQuantity < 0) {
            itemQuantity = 0;
        }
        const SQL = `
        UPDATE items
        SET name           = '${name}', 
        quantity           = '${itemQuantity}',
        "minimumLevel"     = '${itemMinQuantity}',
        "price"            = '${itemPrice}',
        "value"            = '${itemValue}',
        "barcode"          = '${itemBarcode}',
        "notes"            = '${itemNotes}',
        "tags"             = '${itemTags}',
        "stockOrdered"     =  ${stockOrdered}
        WHERE id           =  ${rowId} AND userid = ${userId};
   `;
        yield pool.query(SQL);
    });
}
function searchForItem(userid, name) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Server searching for item:", name, userid);
        if (!name) {
            name = "null";
            return;
        }
        else {
            if (name.includes('\'')) {
                name = sanitizeApostrophe(name);
            }
        }
        const SQL = `
            SELECT * FROM items
            WHERE LOWER(name) LIKE '%${name}%' AND userid = ${userid}
            ORDER BY name;
        `;
        const { rows } = yield pool.query(SQL);
        return rows;
    });
}
function searchForLowStockItem(userId, name) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Server searching for item:", name, "User ID:", userId);
        if (!name) {
            name = "null";
            return;
        }
        else {
            if (name.includes('\'')) {
                name = sanitizeApostrophe(name);
            }
        }
        const SQL = `
            SELECT * FROM items
            WHERE LOWER(name) LIKE '%${name}%' AND userid = ${userId}
            ORDER BY name;
        `;
        const { rows } = yield pool.query(SQL);
        let lowStockItems = [];
        for (let i = 0; i < rows.length; i++) {
            if (Number(rows[i].quantity) < Number(rows[i].minimumLevel)) {
                lowStockItems.push(rows[i]);
            }
        }
        return lowStockItems;
    });
}
function deleteAllItems(userid) {
    return __awaiter(this, void 0, void 0, function* () {
        const SQL = `
            DELETE FROM items
            WHERE userid = ${userid};
        `;
        yield pool.query(SQL);
    });
}
function backupItemsTable(userid) {
    return __awaiter(this, void 0, void 0, function* () {
        yield pool.query(`DELETE FROM "items-backup" WHERE userid = ${userid};`);
        const SQL = `
            INSERT INTO "items-backup" (id, name, quantity, "minimumLevel", price, value, barcode, notes, tags, "stockOrdered", userid)
            select id, name, quantity, "minimumLevel", price, value, barcode, notes, tags, "stockOrdered", userid
            FROM "items";
        `;
        yield pool.query(SQL);
    });
}
function overwriteItemsTableWithBackup(userid) {
    return __awaiter(this, void 0, void 0, function* () {
        const SQL = `
            INSERT INTO "items" (id, name, quantity, "minimumLevel", price, value, barcode, notes, tags, "stockOrdered", userid)
            select id, name, quantity, "minimumLevel", price, value, barcode, notes, tags, "stockOrdered", userid
            FROM "items-backup"
        `;
        yield pool.query(SQL);
    });
}
function calculateItemsMetaData(userid) {
    return __awaiter(this, void 0, void 0, function* () {
        const rows = yield getAllItems(userid);
        const metaData = {
            numOfItems: 0,
            totalQuantity: 0,
            totalValue: 0
        };
        for (let i = 0; i < rows.length; i++) {
            metaData.numOfItems += 1;
            metaData.totalQuantity += Number(rows[i].quantity);
            var value = Number(rows[i].value);
            if (isNaN(value))
                value = 0;
            metaData.totalValue += value;
        }
        metaData.totalValue = Number(metaData.totalValue.toFixed(2));
        const SQL = `
        UPDATE "itemsTableData"
        SET "totalItems"           = ${metaData.numOfItems}, 
        "totalQuantity"            = ${metaData.totalQuantity},
        "totalValue"               = ${metaData.totalValue}
        WHERE id = 1;
   `;
        yield pool.query(SQL);
        return metaData;
    });
}
function logActivity(userid, type, itemId, itemName, oldValue, newValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        const time = now.toTimeString();
        const date = now.toLocaleDateString();
        const timestamp = Date.now();
        console.log('logging item name', itemName, 'timestamp:', timestamp);
        const SQL = `
        INSERT INTO "activity-log" (userid, type, "itemId", "itemName", "oldValue", "newValue", "timestamp")
        VALUES (${userid}, '${type}', '${itemId}', '${itemName}', '${oldValue}', '${newValue}', '${timestamp}');
   `;
        yield pool.query(SQL);
    });
}
function removeActivityLogById(dbRowId) {
    return __awaiter(this, void 0, void 0, function* () {
        const SQL = `
        DELETE FROM "activity-log" WHERE id = ${dbRowId};
    `;
        yield pool.query(SQL);
    });
}
function getActivityLog(userid) {
    return __awaiter(this, void 0, void 0, function* () {
        const { rows } = yield pool.query(`
        SELECT * FROM "activity-log" 
        WHERE userid = ${userid} ORDER BY "timestamp" DESC;`);
        return rows;
    });
}
function addUser(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('adding user: ', username);
            yield pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, password]);
        }
        catch (error) {
            throw new Error("Error signing up: " + error.message);
        }
    });
}
function getUserByUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const { rows } = yield pool.query("SELECT * FROM users WHERE username = $1", [username]);
        return rows[0];
    });
}
function getUserById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const { rows } = yield pool.query("SELECT * FROM users WHERE id = $1", [id]);
        return rows[0];
    });
}
//# sourceMappingURL=queries.js.map