const pool = require("./pool");


async function getAllItems() {
    const { rows } = await pool.query("SELECT * FROM items ORDER BY name ASC");
    return rows;
}

async function getAllLowStockItems() 
{
    const { rows } = await pool.query("SELECT * FROM items ORDER BY id");

    let lowStockItems = [];
    for (let i=0; i<rows.length; i++)
    {
        if (Number(rows[i].quantity) < Number(rows[i].minimumLevel))
        {
            lowStockItems.push(rows[i]);
        }
    }

    return lowStockItems;
}

async function getItemById(id) {
    const { rows } = await pool.query(`SELECT * FROM items WHERE "id" = ${id}`);
    return rows;
}

function sanitizeApostrophe(inputString)
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

async function addItem(name, quantity, minLevel, price, value, barcode, notes, tags) 
{
    console.log("inserting item: ", barcode);


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

    console.log('item name is', name);

    const SQL = `
    INSERT INTO items (name, quantity, "minimumLevel", price, value, barcode, notes, tags)
    VALUES ('${name}', '${quantity}', '${minLevel}', '${price}', '${value}', '${barcode}', '${notes}', '${tags}');
    `;

    try {
        await pool.query(SQL);
    }
    catch (err) {
        next(err);
        throw new Error(`${err}: couldnt add item. SQL: ${SQL}`); 
    }
}

async function deleteItem(itemId) 
{
    const SQL = `
    DELETE FROM items WHERE id = ${itemId};
    `;

    await pool.query(SQL);
}

async function deleteArrayOfItems(items)
{
    let SQL;
    for (i=0; i<items.length; i++) 
    {
        console.log('deleting', items[i]);
        
        const SQL = `
            DELETE FROM items WHERE id = ${items[i]};
        `;
        await pool.query(SQL);
    }
}

async function updateItemOrderedStatus(itemId, stockOrdered)
{
    try 
    {
        const SQL = `
            UPDATE items
            SET "stockOrdered" = ${stockOrdered} 
            WHERE id = ${ itemId };
        `;

        await pool.query(SQL);
    }
    catch (error) {
        console.log('Error trying to update stock ordered status: ', error);
    }
}

async function updateItem(itemIndex, name, itemQuantity, itemMinQuantity, itemPrice, itemValue, itemBarcode, 
                          itemNotes, itemTags, stockOrdered)
{
    if (itemQuantity < 0) {
        itemQuantity = 0;
    }

    const SQL = `
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
        WHERE id = ${ itemIndex };
   `;

   await pool.query(SQL);
}

async function searchForItem(name) 
{
    console.log("Server searching for item:", name);
    
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
            WHERE LOWER(name) LIKE '%${name}%'
            ORDER BY name;
        `;

    const { rows } = await pool.query(SQL);
    return rows;
}

async function searchForLowStockItem(name) 
{
    console.log("Server searching for item:", name);
    
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
            WHERE LOWER(name) LIKE '%${name}%'
            ORDER BY name;
        `;

    const { rows } = await pool.query(SQL);
    let lowStockItems = [];

    for (let i=0; i<rows.length; i++)
    {
        if (Number(rows[i].quantity) < Number(rows[i].minimumLevel))
        {
            lowStockItems.push(rows[i]);
        }
    }

    return lowStockItems;
}

async function deleteAllItems()
{
    const SQL = `
            DELETE FROM items;
        `;

    await pool.query(SQL);
}

async function backupItemsTable()
{
    await pool.query(`DELETE FROM "items-backup";`)

    const SQL = `
            INSERT INTO "items-backup" (id, name, quantity, "minimumLevel", price, value, barcode, notes, tags, "stockOrdered")
            select id, name, quantity, "minimumLevel", price, value, barcode, notes, tags, "stockOrdered"
            FROM "items";
        `;

    await pool.query(SQL);
}

async function overwriteItemsTableWithBackup()
{
    const SQL = `
            INSERT INTO "items" (id, name, quantity, "minimumLevel", price, value, barcode, notes, tags, "stockOrdered")
            select id, name, quantity, "minimumLevel", price, value, barcode, notes, tags, "stockOrdered"
            FROM "items-backup";
        `;

    await pool.query(SQL);
}

async function calculateItemsMetaData()
{
    const rows = await getAllItems();

    const metaData = {
        numOfItems: 0,
        totalQuantity: 0,
        totalValue: 0
    }

    for (i=0; i<rows.length; i++) 
    {
        metaData.numOfItems += 1;
        metaData.totalQuantity += Number(rows[i].quantity);

        var value = Number(rows[i].value);
        if (isNaN(value))
            value = 0;

        metaData.totalValue += value;
    }

    metaData.totalValue = metaData.totalValue.toFixed(2);

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

async function logActivity(type, itemId, itemName, oldValue, newValue)
{
    const now = new Date();
    const time = now.toTimeString();
    const date = now.toLocaleDateString();
    const timestamp = Date.now();

    console.log('logging item name', itemName, 'timestamp:', timestamp);

    const SQL = `
        INSERT INTO "activity-log" (type, "itemId", "itemName", "oldValue", "newValue", "timestamp")
        VALUES ('${type}', '${itemId}', '${itemName}', '${oldValue}', '${newValue}', '${timestamp}');
   `;

    await pool.query(SQL);
}

async function removeActivityLogById(dbRowId)
{
    const SQL = `
        DELETE FROM "activity-log" WHERE id = ${dbRowId};
    `;

    await pool.query(SQL);
}

async function getActivityLog()
{
    const { rows } = await pool.query(`SELECT * FROM "activity-log" ORDER BY "timestamp" DESC;`);
    return rows;
}

module.exports = {
    getAllItems, 
    getAllLowStockItems,
    addItem,
    updateItem,
    updateItemOrderedStatus,
    searchForItem,
    searchForLowStockItem,
    getItemById,
    deleteAllItems,
    backupItemsTable,
    overwriteItemsTableWithBackup,
    deleteArrayOfItems,
    deleteItem,
    calculateItemsMetaData,
    logActivity,
    removeActivityLogById,
    getActivityLog
};