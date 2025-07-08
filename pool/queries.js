const pool = require("./pool");


async function getAllItems() {
    const { rows } = await pool.query("SELECT * FROM items ORDER BY id");
    return rows;
}

async function getItemById(id) {
    const { rows } = await pool.query(`SELECT * FROM items WHERE id = ${id}`);
    return rows;
}

async function addItem(name, quantity, minLevel, price, value, barcode, notes, tags) 
{
    console.log("inserting item: ", barcode);

    if (!name) {
        name = "";
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
    INSERT INTO items (name, quantity, "minimumLevel", price, value, barcode, notes, tags)
    VALUES ('${name}', '${quantity}', '${minLevel}', '${price}', '${value}', '${barcode}', '${notes}', '${tags}')
    `;

    await pool.query(SQL);
}

async function deleteItem(itemId) 
{
    const SQL = `
    DELETE FROM items WHERE id = ${itemId};
    `;

    await pool.query(SQL);
}

async function updateItem(itemIndex, name, itemQuantity, itemMinQuantity, itemPrice, itemValue, itemBarcode, 
                          itemNotes, itemTags)
{
    console.log("updating... item:" + itemIndex + " " + itemPrice);

    const SQL = `
    UPDATE items
    SET name           = '${ name }', 
    quantity           = '${ itemQuantity }',
    "minimumLevel"     = '${ itemMinQuantity }',
    "price"            = '${ itemPrice }',
    "value"            = '${ itemValue }',
    "barcode"          = '${ itemBarcode }',
    "notes"            = '${ itemNotes }',
    "tags"             = '${ itemTags }'
    WHERE id = ${ itemIndex };
   `;

   await pool.query(SQL);
}

async function searchForItem(name) {
    console.log("Server searching for item:", name);
    
    const SQL = `
        SELECT * FROM items
        WHERE LOWER(name) LIKE '%${name}%';
        `;

    const { rows } = await pool.query(SQL);
    console.log("rows ", rows)
    return rows;
}

async function deleteAllItems()
{
    const SQL = `
        DELETE FROM items;
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
        metaData.totalValue += Number(rows[i].value);
    }

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

module.exports = {
    getAllItems, 
    addItem,
    updateItem,
    searchForItem,
    getItemById,
    deleteAllItems,
    deleteItem,
    calculateItemsMetaData
};