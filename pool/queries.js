const pool = require("./pool");


async function getAllItems() {
    const { rows } = await pool.query("SELECT * FROM items ORDER BY id");
    return rows;
}

async function insertItem(name, quantity, minLevel, price) {
    console.log("inserting: ");

    if (!quantity) {
        quantity = 0;
    }

    if (!minLevel) {
        minLevel = 0;
    }

    if (!price) {
        price = 0;
    }

    const SQL = `
    INSERT INTO items (name, quantity, "minimumLevel", price)
    VALUES ('${name}', '${quantity}', '${minLevel}', '${price}');
    `;

    await pool.query(SQL);
}

async function updateItem(itemIndex, name, itemQuantity, itemMinQuantity, itemPrice) {
    console.log("updating... item:" + itemIndex + " " + itemPrice);

    const SQL = `
    UPDATE items
    SET name         = '${ name }', 
    quantity         = '${ itemQuantity }',
    "minimumLevel"   = '${ itemMinQuantity }',
    "price"          = '${ itemPrice }'
    WHERE id = ${ itemIndex } ;
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

module.exports = {
    getAllItems, insertItem, updateItem, searchForItem
};