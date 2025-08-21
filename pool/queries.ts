const pool = require("./pool").default;


export async function getAllItems(userid) {
    const { rows } = await pool.query(`SELECT * FROM items WHERE userid = ${userid} ORDER BY name ASC `);
    return rows;
}

export async function getAllLowStockItems(userid) 
{
    const { rows } = await pool.query(`SELECT * FROM items WHERE userid = ${userid} ORDER BY id ASC`);

    let lowStockItems = [];
    for (let i = 0; i<rows.length; i++)
    {
        if (Number(rows[i].quantity) < Number(rows[i].minimumLevel))
        {
            lowStockItems.push(rows[i]);
        }
    }

    return lowStockItems;
}

export async function getItemByRowId(userId, rowId) {
    const { rows } = await pool.query(
        `SELECT * FROM items
         WHERE "id" = $1
         AND "userid" = $2`,
        [rowId, userId]
    );
    return rows;
}

export function sanitizeApostrophe(inputString)
{
    if (inputString.includes('\''))
    {
        const index = inputString.indexOf('\'');
        const apostrophe = '\''
        const firstHalf = inputString.substring(0, index);
        const secondHalf = inputString.substring(index, inputString.length);
        const newString = firstHalf + apostrophe + secondHalf;

        return newString;
    }
    else 
    {
        return inputString;
    }
}

export async function addItem(userid, name, quantity, minLevel, price, value, barcode, notes, tags) 
{
    console.log("inserting item: ", name, "for user:", userid);

    if (!name) {
        name = "null";
        return;
    }
    else
    { 
        if (name.includes('\''))
        {
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
        await pool.query(SQL);
    }
    catch (err) {
        throw new Error(`${err}: couldnt add item. SQL: ${SQL}`); 
    }
}

export async function deleteItem(userId,itemId) 
{
    const SQL = `
        DELETE FROM items WHERE id = ${itemId} AND userid = ${userId};
    `;

    await pool.query(SQL);
}

export async function deleteArrayOfItems(userId, items)
{
    let SQL;
    for (let i = 0; i<items.length; i++) 
    {
        console.log('deleting', items[i]);
        
        const SQL                      = `
            DELETE FROM items WHERE id = ${items[i]};
        `;
        await pool.query(SQL);
    }
}

export async function updateItemOrderedStatus(userid, itemId, stockOrdered)
{
    try 
    {
        const SQL = `
            UPDATE items
            SET "stockOrdered" = ${stockOrdered}
            WHERE id = ${itemId} AND userid = ${userid};
        `;

        await pool.query(SQL);
    }
    catch (error) {
        console.log('Error trying to update stock ordered status: ', error);
    }
}

export async function updateItem(userId, rowId, name, itemQuantity, itemMinQuantity, itemPrice, itemValue, itemBarcode, 
                          itemNotes, itemTags, stockOrdered)
{
    if (itemQuantity < 0) {
        itemQuantity = 0;
    }

    const SQL              = `
        UPDATE items
        SET name           = '${ name }', 
        quantity           = '${ itemQuantity }',
        "minimumLevel"     = '${ itemMinQuantity }',
        "price"            = '${ itemPrice }',
        "value"            = '${ itemValue }',
        "barcode"          = '${ itemBarcode }',
        "notes"            = '${ itemNotes }',
        "tags"             = '${ itemTags }',
        "stockOrdered"     =  ${stockOrdered}
        WHERE id           =  ${ rowId } AND userid = ${ userId };
   `;

   await pool.query(SQL);
}

export async function searchForItem(userid, name) 
{
    console.log("Server searching for item:", name, userid);
    
    if (!name) {
        name = "null";
        return;
    }
    else
    { 
        if (name.includes('\''))
        {
            name = sanitizeApostrophe(name);
        }
    }

    const SQL = `
            SELECT * FROM items
            WHERE LOWER(name) LIKE '%${name}%' AND userid = ${userid}
            ORDER BY name;
        `;

    const { rows } = await pool.query(SQL);
    return rows;
}

export async function searchForLowStockItem(userId, name) 
{
    console.log("Server searching for item:", name, "User ID:", userId);

    if (!name) {
        name = "null";
        return;
    }
    else
    { 
        if (name.includes('\''))
        {
            name = sanitizeApostrophe(name);
        }
    }

    const SQL = `
            SELECT * FROM items
            WHERE LOWER(name) LIKE '%${name}%' AND userid = ${userId}
            ORDER BY name;
        `;

    const { rows } = await pool.query(SQL);
    let lowStockItems = [];

    for (let i = 0; i<rows.length; i++)
    {
        if (Number(rows[i].quantity) < Number(rows[i].minimumLevel))
        {
            lowStockItems.push(rows[i]);
        }
    }

    return lowStockItems;
}

export async function deleteAllItems(userid)
{
    const SQL = `
            DELETE FROM items
            WHERE userid = ${userid};
        `;

    await pool.query(SQL);
}

export async function backupItemsTable(userid)
{
    await pool.query(`DELETE FROM "items-backup" WHERE userid = ${userid};`)

    const SQL = `
            INSERT INTO "items-backup" (id, name, quantity, "minimumLevel", price, value, barcode, notes, tags, "stockOrdered", userid)
            select id, name, quantity, "minimumLevel", price, value, barcode, notes, tags, "stockOrdered", userid
            FROM "items";
        `;

    await pool.query(SQL);
}

export async function overwriteItemsTableWithBackup(userid)
{
    const SQL = `
            INSERT INTO "items" (id, name, quantity, "minimumLevel", price, value, barcode, notes, tags, "stockOrdered", userid)
            select id, name, quantity, "minimumLevel", price, value, barcode, notes, tags, "stockOrdered", userid
            FROM "items-backup"
        `;

    await pool.query(SQL);
}

export  async function calculateItemsMetaData(userid)
{
    const rows = await getAllItems(userid);

    const metaData = {
        numOfItems: 0,
        totalQuantity: 0,
        totalValue: 0
    }

    for (let i = 0; i<rows.length; i++) 
    {
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
        SET "totalItems"           = ${ metaData.numOfItems }, 
        "totalQuantity"            = ${ metaData.totalQuantity },
        "totalValue"               = ${ metaData.totalValue }
        WHERE id = 1;
   `;

    await pool.query(SQL);

    return metaData;
}

export async function logActivity(userid, type, itemId, itemName, oldValue, newValue)
{
    const now = new Date();
    const time = now.toTimeString();
    const date = now.toLocaleDateString();
    const timestamp = Date.now();

    console.log('logging item name', itemName, 'timestamp:', timestamp);

    const SQL = `
        INSERT INTO "activity-log" (userid, type, "itemId", "itemName", "oldValue", "newValue", "timestamp")
        VALUES (${userid}, '${type}', '${itemId}', '${itemName}', '${oldValue}', '${newValue}', '${timestamp}');
   `;

    await pool.query(SQL);
}

export async function removeActivityLogById(dbRowId)
{
    const SQL = `
        DELETE FROM "activity-log" WHERE id = ${dbRowId};
    `;

    await pool.query(SQL);
}

export async function getActivityLog(userid)
{
    const { rows } = await pool.query(`
        SELECT * FROM "activity-log" 
        WHERE userid = ${userid} ORDER BY "timestamp" DESC;`);
    return rows;
}

export async function addUser(username, password) 
{
    try {
        console.log('adding user: ', username);
        
        await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, password]);
    } catch (error) {
        throw new Error("Error signing up: " + error.message);
    }
}

export async function getUserByUsername(username) 
{
    const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    return rows[0];
}

export async function getUserById(id) 
{
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return rows[0];
}