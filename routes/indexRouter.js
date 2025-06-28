const { Router }  = require("express")
const indexRouter = Router();
const db          = require("../pool/queries");

indexRouter.get("/", async (req, res) => 
{
    const items = await db.getAllItems();
    res.render("index", { title: "Inventory", items: items });
});

indexRouter.get("/new", (req, res) => 
{
  res.render("form", { });
});

indexRouter.get("/edit/:itemIndex", async (req, res) => 
{
  const itemIndex = req.params.itemIndex;
  const items     = await db.getAllItems();
  res.render("itemDetails", { itemIndex: itemIndex, items: items });
});

indexRouter.post("/edit/:itemIndex", async (req, res) =>
{
  console.log(`edit post: ${ req.body.itemName } ${ req.body.itemQuantity} ${req.body.itemMinQuantity} ${req.body.itemPrice} `)
  itemIndex = Number(req.params.itemIndex) + 1; // Database starts counting at 1. Not 0.
  await db.updateItem(itemIndex,
                     req.body.itemName,
                     req.body.itemQuantity,
                     req.body.itemMinQuantity,
                     req.body.itemPrice);
  res.send('Item updated');
});

indexRouter.post("/new", async (req, res) => 
{
  console.log(`post ${req.body.name}`);
  item = req.body;
  await db.insertItem(item.itemName, item.quantity, item.minLevel, item.price);
  res.redirect("/");
});

module.exports = indexRouter