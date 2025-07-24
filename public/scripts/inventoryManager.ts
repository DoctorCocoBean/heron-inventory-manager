class QuantityChangeTimer
{
    id: number = -1;
    itemId: number = -1;
    started: boolean = false;
    finalQuantity: number = 0;
};

class Item 
{
    name        : string ='';
    itemId      : number = -1;
    quantity    : number = 0;
    minimumLevel: number = 0;
    price       : number = 0;
    value       : number = 0;
    barcode     : number = 0;
    tags        : string = '';
    notes       : string = '';
    stockOrdered: boolean = false;
}

class QuanityChangeSummary
{
    name : string = '';
    totalSubtactions: number = 0;
    totalAdditions: number = 0;
}

enum LogType 
{
    QUANTITY = 1,
}

// --- GLOBALS -----
var isEditingRow = false;
var searchBar   = document.getElementById("searchBar");
const itemTable = document.getElementById("itemTable");
const popup     = document.getElementById("editItemModal");
const editItemDialog = document.getElementById("editItemModal");
var quantityChangeTimer = new QuantityChangeTimer();
var selectedItems = [];

function showPopup(msg) 
{
    const popup = document.getElementById('msgPopup');
    popup.innerHTML = msg;
    popup.classList.remove('msgPopup-hide');
    popup.style.display = 'block';
    setTimeout(() => 
    {
        popup.classList.add('msgPopup-hide');
    }, 1500);
}

function openNewItemDialog()
{
    const popup = document.getElementById('editItemModal');

    $('#editItemModal').modal()

    popup.innerHTML = `
        <div class="modal-dialog">

        <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header">
            <h4 class="modal-title">Edit Item</h4>
            </div>
            <div class="modal-body">

                <div class="container">
                <div class="row">
                    <div class="col-md p-3" style="line-height: 1.8">
                    Name: <br>
                    Quantity: <br>
                    Minimum Level: <br>
                    Price: <br>
                    Value: <br>
                    Barcode: <br>
                    </div>
                    <div class="col-sm">
                        <input type="text" id="nameInput" ></input> <br>
                        <input type="text" id="quantityInput"  ></input> <br>
                        <input type="text" id="minQuantityInput" ></input> <br>
                        <input type="text" id="priceInput" ></input> <br>
                        <input type="text" id="valueInput" ></input> <br>
                        <input type="text" id="barcodeInput" ></input> <br>
                        <input type="text" id="notesInput" ></input> <br>
                        <input type="text" id="tagsInput" ></input> <br>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-default" onclick="addItem()">Save</button>

            </div>
        </div>
        
        </div>
    `
}

enum Operation {
    NONE = 0,
    ADD,
    SUBTRACT,
}

function calculate(numA: number, numB: number, op: Operation): number
{
    if (op == Operation.SUBTRACT)
    {
        return numA - numB;
    }
    else if (op == Operation.ADD)
    {
        return numA + numB;
    }
    else
    {
        return null;
    }
}

function calculateInputField(inputData: string): number
{
    // If contains subtraction symbol do substration
    var initialInputData = inputData;
    var op             = Operation.NONE;
    var nextOp         = Operation.NONE;
    var element        = '';
    var result: number = null;

    // Parse text input string
    for (let i = 0; i < inputData.length; i++) 
    {
        if (isNaN(Number(inputData[i]))) // Check for operation symbol or non number
        {
            if (inputData[i] == '-') 
            {
                if (op == Operation.NONE)
                    op = Operation.SUBTRACT;
                else
                    nextOp = Operation.SUBTRACT;
            }
            else if (inputData[i] == '+')
            {
                if (op == Operation.NONE)
                    op = Operation.ADD;
                else
                    nextOp = Operation.ADD;
            }
            else // Error
            {
                console.log('Error: text input contains invalid input');
                showPopup('Error: text input contains invalid input')
                return null;
            }

            if (result == null) // Check if two numbers can be calcuated together
            {
                result = Number(element);
                element = '';
            }
            else
            {
                result  = calculate(result, Number(element), op);
                element = '';
                op      = nextOp;
                nextOp  = Operation.NONE;
            }

            continue;
        }

        element += inputData[i];
    }

    // If no equation just output the number
    if (op == Operation.NONE && nextOp == Operation.NONE)
    {
        if (isNaN(Number(inputData))) {
            result = null;
        } else {
            result = Number(inputData);
            return result;
        }
    }

    // Done parsing so check to see if there's one more number to add to caclulation
    if ((result != null) && element != '') {
        result = calculate(result, Number(element), op);
        if (result == null)
            console.log("error calculating");
    }

    return result;
}

async function openEditItemDialog(itemId: number): Promise<void>
{ 
    console.log('opening');
    
    if (isEditingRow) {
        return;
    }

    console.log('goto item', itemId)
    itemId = itemId;

    const request = new Request(`/getItemById/${itemId}`, {
        method: "GET",
        headers: { 'Content-Type': 'application/json' }
    })

    const response = await fetch(request);
    const data = response.json().then((data) => 
    {
        console.log('data: ', data);

        if (data.length <= 0) {
            console.log('Error. data is empty');
            return;
        }

        $('#editItemModal').modal()

        editItemDialog.innerHTML = `
            <div class="modal-dialog">

            <!-- Modal content-->
            <div class="modal-content">
                <div class="modal-header">
                <h4 class="modal-title">Edit Item</h4>
                </div>
                <div class="modal-body">

                    <div class="row" style="font-family: var(--primary-font);">
                        <div class="col-md" style="line-height: 3;">
                        </div>
                        <div class="col-sm" style="line-height: 3;">
                        </div>
                    </div>

                    <div class="row" style="font-family: var(--primary-font);">
                        <div class="col-4"  style="line-height: 3;">
                            Name:  <br>
                            Quantity: <br>
                            Minimum Level: <br>
                            Price: <br>
                            Tags: <br>
                            Barcode: <br>
                            Notes:
                        </div>
                        <div class="col-8" style="line-height: 3;">
                            <input type="text" id="nameInput" value="${data[0]['name']}" class="editInput" style="height: 40px; width: 300px"></input> 
                            <br>

                            <button style="width: 40px; height: 40px; padding: 0px" class="btn btn-primary inventoryBtn" onclick="editPopUpAdjustQuantity(-1)">-</button>
                            <input type="text" id="quantityInput" value="${data[0]['quantity']}" class="editInput" style="height: 40px; width: 150px" autocomplete="off"></input> 
                            <button style="width: 40px; height: 40px; padding: 0px" class="btn btn-primary inventoryBtn" onclick="editPopUpAdjustQuantity(1)">+</button>
                            <br>

                            <button style="width: 40px; height: 40px; padding: 0px" class="btn btn-primary inventoryBtn" onclick="editInputFieldNum('minimumLevelInput', -1)">-</button>
                            <input type="text" id="minimumLevelInput" value="${data[0]['minimumLevel']}" class="editInput" style="height: 40px; width: 150px"></input> 
                            <button style="width: 40px; height: 40px; padding: 0px" class="btn btn-primary inventoryBtn" onclick="editInputFieldNum('minimumLevelInput', 1)">+</button>
                            <br>

                            <input type="text" id="priceInput" value="${data[0]['price']}" class="editInput" style="height: 40px; width: 150px"></input> 

                            <p style="display: inline; padding-left:20px;">Value: <b id="valueText" class="enhancedText">${data[0]['value']}</b></p>

                            <input type="text" id="tagsInput" value="${data[0]['tags']}" class="editInput" style="height: 40px; width: 300px"></input> 

                            <input type="text" id="barcodeInput" value="${data[0]['barcode']}" class="editInput" style="height: 40px; width: 300px"></input> 

                            <textarea id="notesInput" value="${data[0]['notes']} rows="5" col="100" class="editInput" style="width: 300px">${data[0]['notes']}</textarea>
                        </div>
                    </div>

                    <div class="row" style="font-family: var(--primary-font);">
                        <div class="col-md"  style="line-height: 3;">
                        </div>
                    </div>

                    <div class="d-flex justify-content-between">
                        <div class="">
                        <button type="button" class="btn btn-primary inventoryBtn" data-dismiss="modal">Close</button>
                        </div>
                        <div class="">
                        <button type="button" class="btn btn-primary inventoryBtn" data-dismiss="modal" onclick="deleteItem(${data[0]['id']})">Delete</button>
                        <button type="button" class="btn btn-primary inventoryBtn" onclick="editItemDialogUpdate(${data[0]['id']})">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        `

        // Update item value when quanity changes
        const quantityInput: HTMLInputElement = document.getElementById('quantityInput') as HTMLInputElement;
        const initialValue  = quantityInput.value;

        // On key up
        quantityInput.addEventListener('keyup', (event) => 
        {
            const input: HTMLInputElement = document.getElementById('quantityInput') as HTMLInputElement;
            console.log(input.value);
            

            if (event.key == 'Enter') 
            {
                const result = calculateInputField(input.value);
                if (result == null)
                    input.value = initialValue; 
                else
                    input.value = String(result);
            }

            if (typeof Number(input.value) === 'number' && !isNaN(Number(input.value))) 
            {
                const price      = (document.getElementById('priceInput') as HTMLInputElement).value;
                const quantity   = Number(input.value);
                const value      = Number(price) *  quantity;
                const valueText = document.getElementById('valueText');
                valueText.innerHTML = Number(value).toFixed(2);
            }
            else
            {
                const msg = 'Quanity isnt number';
                document.getElementById('valueText').innerHTML = msg;
            }
        });

        // Update item value when price changes
        const priceInput = document.getElementById('priceInput');
        priceInput.addEventListener('keyup', () => 
        {
            const input = document.getElementById('priceInput') as HTMLInputElement;

            if (typeof Number(input.value) === 'number' && !isNaN(Number(input.value))) 
            {
                const price      = Number(input.value);
                const quantity   = Number((document.getElementById('quantityInput') as HTMLInputElement).value);
                const value      = price *  quantity;
                const valueText = document.getElementById('valueText');
                valueText.innerHTML = Number(value).toFixed(2);
            }
            else
            {
                const msg = 'Price isnt number';
                const priceInput = document.getElementById('valueText').innerHTML = msg;
            }
        });
    });
}

function getHTMLInputById(id: string): HTMLInputElement
{
    return document.getElementById(id) as HTMLInputElement;
}

async function addItem()
{
    const itemName          = getHTMLInputById('nameInput').value;
    const itemQuantity      = getHTMLInputById('quantityInput').value;
    const itemMinQuantity   = getHTMLInputById('minQuantityInput').value;
    const itemPrice         = getHTMLInputById('priceInput').value;
    const itemValue         = getHTMLInputById('valueInput').value;
    const itemBarcode       = getHTMLInputById('barcodeInput').value;
    const itemNotes         = getHTMLInputById('notesInput').value;
    const itemTags          = getHTMLInputById('tagsInput').value;

    const request = new Request(`/addItem`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            itemName: itemName,
            itemQuantity: itemQuantity ,
            itemMinQuantity: itemMinQuantity,
            itemPrice: itemPrice,
            itemValue: itemValue,
            itemBarcode: itemBarcode,
            itemNotes: itemNotes,
            itemTags: itemTags,
        }),
    })

    const response = await fetch(request);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP Error: Status ${response.status}, Message: ${errorData.message || 'Unknow err'}`);
    }

    $('#editItemModal').modal('hide');
}

async function deleteItem(itemId: number)
{
    const item = await getItemById(itemId);
    const name = item[0].name;

    const request = new Request(`/deleteItem`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            itemId: itemId,
        }),
    })

    const response = await fetch(request);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP Error: Status ${response.status}, Message: ${errorData.message || 'Unknow err'}`);
    }

    $('#editItemModal').modal('hide');
    loadItemTable();

    const msg = 'Item: ' + name + ' deleted.'
    showPopup(msg);
}

async function deleteSelectedItems()
{
    const request = new Request(`/deleteArrayOfItems`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            items: selectedItems,
        }),
    })

    const response = await fetch(request);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP Error: Status ${response.status}, Message: ${errorData.message || 'Unknow err'}`);
    }

    loadItemTable();
    showPopup('Deleted selected items');
}

async function deleteAllItems()
{
    const request = new Request(`/deleteAllItems`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ }),
    })

    const response = await fetch(request).then(() => {
        loadItemTable();
    });
}

async function getItemById(itemId)
{
    const request = new Request(`/getItemById/${itemId}`, {
        method: "GET",
        headers: { 'Content-Type': 'application/json' }
    })

    const response = await fetch(request);
    const data = await response.json().then((data) => 
    {
        return data;
    });

    return data;
}

async function getItemNameById(itemId)
{
    const request = new Request(`/getItemById/${itemId}`, {
        method: "GET",
        headers: { 'Content-Type': 'application/json' }
    })

    const response = await fetch(request);
    const data = await response.json().then((data) => 
    {
        return data;
    });

    return data.name;
}

async function updateItem(itemData: Item)
{
    console.log('upate item');
    
    const item    = await getItemById(itemData.itemId);
    const request = new Request(`/edit/${itemData.itemId}`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            itemName: itemData.name,
            itemQuantity: itemData.quantity,
            itemMinQuantity: itemData.minimumLevel,
            itemPrice: itemData.price,
            itemValue: itemData.value,
            itemBarcode: item[0].barcode,
            itemNotes: item[0].notes,
            itemTags: item[0].tags,
            itemStockOrdered: itemData.stockOrdered,
        }),
    })
    
    const response = await fetch(request);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP Error: Status ${response.status}, Message: ${errorData.message || 'Unknow err'}`);
    }
}

async function editItemDialogUpdate(itemId) 
{
    const itemName          = getHTMLInputById('nameInput').value;
    const itemQuantity      = Number(getHTMLInputById('quantityInput').value);
    const itemMinQuantity   = Number(getHTMLInputById('minimumLevelInput').value);
    const itemPrice         = Number(getHTMLInputById('priceInput').value);
    const itemBarcode       = getHTMLInputById('barcodeInput').value;
    const itemNotes         = getHTMLInputById('notesInput').value;
    const itemTags          = getHTMLInputById('tagsInput').value;

    const request = new Request(`/edit/${itemId}`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            itemName: itemName,
            itemQuantity: itemQuantity ,
            itemMinQuantity: itemMinQuantity,
            itemPrice: itemPrice,
            itemBarcode: itemBarcode,
            itemNotes: itemNotes,
            itemTags: itemTags,
        }),
    })
    
    const response = await fetch(request);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP Error: Status ${response.status}, Message: ${errorData.message || 'Unknow err'}`);
    }

    $('#editItemModal').modal('hide');

    const tableRow = document.getElementById(`tableRow_${itemId}`);
    const itemValue = Number(itemQuantity) * Number(itemPrice);
    tableRow.innerHTML = createTableRowHTML(itemId, itemName, itemQuantity, itemMinQuantity, itemPrice, itemValue);
}


function editPopupDecreaseQuantity()
{
    const qualityInput = getHTMLInputById('quantityInput');
    console.log(qualityInput, qualityInput.value);

    qualityInput.value = String(Number(qualityInput.value) - 1)
    if (Number(qualityInput.value) < 0)
        qualityInput.value = String(0);
}

function editInputFieldNum(inputId, numberAdjustment)
{
    const inputField = getHTMLInputById(inputId);
    inputField.value = Number(inputField.value) + numberAdjustment;
    if (Number(inputField.value) < 0)
        inputField.value = String(0);
}

function editPopUpAdjustQuantity(numberAdjustment)
{
    editInputFieldNum('quantityInput', numberAdjustment);
    const price      = getHTMLInputById('priceInput').value;
    const quantity   = getHTMLInputById('quantityInput').value;
    const value      = Number(price) *  Number(quantity);
    const priceInput = document.getElementById('valueText');
    priceInput.innerHTML = Number(value).toFixed(2);
}

async function incrementQuantity(itemId)
{
    event.stopPropagation();

    const tableRow = document.getElementById(`tableRow_${itemId}`);
    const quantity = Number(tableRow.getElementsByClassName('quantityRow')[0].innerHTML);
    const price    = Number(tableRow.getElementsByClassName('priceRow')[0].innerHTML);

    var newQuantity   = quantity + 1;
    let value: number = Number(price * quantity);

    tableRow.getElementsByClassName("quantityRow")[0].innerHTML = String(newQuantity);
    tableRow.getElementsByClassName("valueRow")[0].innerHTML    = "$" + value.toFixed(2);

    sendQuantityChangeToTimer(itemId, newQuantity);
}

async function decrementQuantity(itemId)
{
    event.stopPropagation();

    const tableRow = document.getElementById(`tableRow_${itemId}`);
    const quantity = Number(tableRow.getElementsByClassName('quantityRow')[0].innerHTML);
    const price    = Number(tableRow.getElementsByClassName('priceRow')[0].innerHTML);

    var newQuantity = quantity - 1;
    if (newQuantity < 0) {
        newQuantity = 0;
    }

    let value: number = Number(price * quantity);

    tableRow.getElementsByClassName("quantityRow")[0].innerHTML = String(newQuantity);
    tableRow.getElementsByClassName("valueRow")[0].innerHTML    = "$" + value.toFixed(2);

    sendQuantityChangeToTimer(itemId, newQuantity);
}

function sendQuantityChangeToTimer(itemId: number, newQuantity: number)
{
    quantityChangeTimer.finalQuantity = newQuantity;
    quantityChangeTimer.itemId = itemId;
    
    // Reset timer if not done
    if (quantityChangeTimer.started) {
        clearTimeout(quantityChangeTimer.id);
    }
    else {
        quantityChangeTimer.started = true;
    }

    // Start timer
    quantityChangeTimer.id = setTimeout(async () => 
    {
        quantityChangeTimer.started = false;

        // submit edit request
        const item    = await getItemById(quantityChangeTimer.itemId);
        const request = new Request(`/edit/${quantityChangeTimer.itemId}`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                itemName: item[0]['name'],
                itemQuantity: quantityChangeTimer.finalQuantity,
                itemMinQuantity: item[0]['minimumLevel'],
                itemPrice: item[0]['price'],
                itemValue: item[0]['value'],
                itemBarcode: item[0]['barcode'],
                itemNotes: item[0]['notes'],
                itemTags: item[0]['tags'],
            }),
        }) 
        
        const response = await fetch(request);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP Error: Status ${response.status}, Message: ${errorData.message || 'Unknow err'}`);
        }

    }, 500);
}

function onMouseOverRow(itemId: number, isLowStock: boolean)
{
    const tableRow = document.getElementById(`tableRow_${itemId}`);
    const buttons = tableRow.getElementsByTagName('button');
    const lowStockDiv = tableRow.getElementsByClassName('quantityDiv')[0];
    
    if (isLowStock)
    {
        lowStockDiv.classList.remove('textBlockWithBGColor');
        lowStockDiv.classList.add('textBlockNoBGColor');
    }

    for (let i=0; i<buttons.length; i++) {
        buttons[i].style.display = 'inline-block';
    }
}

function onMouseLeaveRow(itemId: number, isLowStock: boolean)
{
    const tableRow = document.getElementById(`tableRow_${itemId}`);
    const buttons = tableRow.getElementsByTagName('button');
    const lowStockDiv = tableRow.getElementsByClassName('quantityDiv')[0];
    
    if (isLowStock)
    {
        lowStockDiv.classList.add('textBlockWithBGColor');
        lowStockDiv.classList.remove('textBlockNoBGColor');
    }

    for (let i=0; i<buttons.length; i++) {
        buttons[i].style.display = 'none';
    }
}

async function onRowLoseFocus(itemId)
{
    if (isEditingRow == false) {
        return;
    }

    const item         = await getItemById(itemId);
    const tableRow     = document.getElementById(`tableRow_${itemId}`);
    const name         = tableRow.getElementsByClassName("nameRow")[0].innerHTML;
    const quantity     = item[0]['quantity']
    const minimumLevel = tableRow.getElementsByClassName("minimumLevelRow")[0].innerHTML;
    const price        = tableRow.getElementsByClassName("priceRow")[0].innerHTML;
    const value        = tableRow.getElementsByClassName("valueRow")[0].innerHTML;

    const request = new Request(`/edit/${itemId}`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            itemName: name,
            itemQuantity: quantity,
            itemMinQuantity: minimumLevel,
            itemPrice: price,
            itemValue: value,
            itemBarcode: item[0].barcode,
            itemNotes: item[0].notes,
            itemTags: item[0].tags,
        }),
    })
    
    const response = await fetch(request);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP Error: Status ${response.status}, Message: ${errorData.message || 'Unknow err'}`);
    }

    changeRowStateToDefaultView(itemId);
}

async function startEditingQuantity(itemId)
{
    event.stopPropagation();
    changeRowStateToEditQuantity(itemId);
}

async function changeRowStateToDefaultView(itemId)
{
    isEditingRow = false;

    const item   = await getItemById(itemId);
    const name         = item[0]['name'];
    const quantity     = item[0]['quantity'];
    const minimumLevel = item[0]['minimumLevel'];
    const price        = item[0]['price'];
    const value        = item[0]['value'];

    const tableRow     = document.getElementById(`tableRow_${itemId}`);
    console.log(quantity, minimumLevel);
    
    if (Number(quantity) > Number(minimumLevel)) {
        tableRow.innerHTML = createTableRowHTML(itemId, name, quantity, minimumLevel, price, value);
    } else {
        tableRow.innerHTML = createLowStockTableRowHTML(itemId, name, quantity, minimumLevel, price, value, false);
    }
}

async function changeRowStateToEditQuantity(itemId)
{
    isEditingRow = true;
    const item   = await getItemById(itemId);

    const tableRow     = document.getElementById(`tableRow_${itemId}`);
    const name         = item[0]['name'];
    const quantity     = item[0]['quantity'];
    const minimumLevel = item[0]['minimumLevel'];
    const price        = item[0]['price'];
    const value        = item[0]['value'];

    const elem = tableRow.getElementsByClassName('quantityDiv')[0];
    elem.innerHTML = `
            <input type="text" class="quantityRow" id="tempInput" value="${quantity}" size="6" onblur="onRowLoseFocus(${itemId})" style="align-text: center;"></input>
    `;

    const quantityInput = getHTMLInputById('tempInput');
    const initialValue  = quantityInput.value;
    
    quantityInput.addEventListener('keydown', function(event) 
    {
        if (event.key == 'Enter') 
        {
            const input  = getHTMLInputById('tempInput');
            const result = calculateInputField(input.value);
            isEditingRow = false; 

            if (result == null)
                input.value = initialValue; 
            else
                input.value = String(result);

            const tableRow          = document.getElementById(`tableRow_${itemId}`);
            const item              = new Item();
                  item.itemId       = itemId;
                  item.name         = tableRow.getElementsByClassName("nameRow")[0].innerHTML;
                  item.quantity     = Number(result);
                  item.minimumLevel = Number(tableRow.getElementsByClassName("minimumLevelRow")[0].innerHTML);
                  item.price        = Number(tableRow.getElementsByClassName("priceRow")[0].innerHTML);
                  item.value        = Number(tableRow.getElementsByClassName("valueRow")[0].innerHTML);

            updateItem(item);

            if (Number(quantity) > Number(minimumLevel)) {
                tableRow.innerHTML = createTableRowHTML(itemId, name, result, minimumLevel, price, value);
            } else {
                tableRow.innerHTML = createLowStockTableRowHTML(itemId, name, result, minimumLevel, price, value, false);
            }

            event.preventDefault();
        }

        if (event.key == "Escape") 
        {
            changeRowStateToDefaultView(itemId);
            event.preventDefault();
        }
    });

    const textInput = getHTMLInputById("tempInput");
    textInput.focus();
    const textLength = textInput.value.length;
    textInput.setSelectionRange(textLength, textLength);
}

async function searchForLowStockItem(name: string) 
{
    if (name == "") {
        name = "all";
    }

    const request = new Request(`/searchLowStock/${name}`, {
        method: "GET",
        headers: { 'Content-Type': 'application/json' }
    })

    const response = await fetch(request);
    const data = response.json().then((data) => {
        console.log(data);

        var tableHTML =  createLowStockTableHeader();
        for (let i=0; i<data.length; i++) 
        {
            tableHTML += createTableRowHTML(data[i]['id'], data[i]['name'], data[i]['quantity'],
                                            data[i]['minimumLevel'], data[i]['price'], data[i]['value']);
        }

        itemTable.innerHTML= tableHTML;
    });
}

async function searchForItem(name: string) 
{
    console.log('search?');
    
    if (name == "") {
        name = "all";
    }

    const request = new Request(`/search/${name}`, {
        method: "GET",
        headers: { 'Content-Type': 'application/json' }
    })

    const response = await fetch(request);
    const data = response.json().then((data) => 
    {
        console.log(data);

        var tableHTML = createTableHeader();
        for (let i=0; i<data.length; i++) 
        {
            tableHTML += createTableRowHTML(data[i]['id'], data[i]['name'], data[i]['quantity'],
                                            data[i]['minimumLevel'], data[i]['price'], data[i]['value']);
        }

        itemTable.innerHTML= tableHTML;
    });
}

async function loadItemTable(searchValue: string)
{
    const request = new Request(`/search/all`, {
        method: "GET",
        headers: { 'Content-Type': 'application/json' }
    })

    const response = await fetch(request);
    const data = response.json().then((data) => 
    {
        var tableHTML = `
            <thead>
                <td style="opacity: 50%; width: 5%"></td>
                <td style="opacity: 50%; width: 25%">Name</td>
                <td style="opacity: 50%; width: 25%; margin-left: 20px; padding: 20px">
                <div style="background-color: none; width: 25px; height: 25px; display: inline-block;"></div>
                Quantity
                </td>
                <td style="opacity: 50%;">Minimum Level</td>
                <td style="opacity: 50%; width: 15%">Price</td>
                <td style="opacity: 50%;">Value</td>
            </thead>
        `

        for (let i=0; i<data.length; i++) 
        {
            tableHTML += createTableRowHTML(data[i]['id'], data[i]['name'], data[i]['quantity'],
                                            data[i]['minimumLevel'], data[i]['price'], data[i]['value']);
        }

        itemTable.innerHTML= tableHTML;
    });
}

async function loadLowStockItemTable()
{
    const request = new Request(`/lowStockItems`, {
        method: "GET",
        headers: { 'Content-Type': 'application/json' }
    })

    const response = await fetch(request);
    const data = response.json().then((data) => 
    {
        console.log(data);
        
        var tableHTML = `
            <thead>
                <td style="opacity: 50%; width: 25%;">Name</td>
                
                <td style="opacity: 50%; width: 25%;">
                <div style="background-color: none; width: 25px; height: 25px; display: inline-block;"></div>
                Quantity
                </td>

                <td style="opacity: 50%; width: 15%;">Minimum Level</td>
                <td style="opacity: 50%;">Price</td>
                <td style="opacity: 50%;">Value</td>
                <td style="opacity: 50%; width: 10%;">Stock Ordered</td>
            </thead>
        `

        for (let i=0; i<data.length; i++) 
        {
            tableHTML += createLowStockTableRowHTML(data[i]['id'], data[i]['name'], data[i]['quantity'],
                                            data[i]['minimumLevel'], data[i]['price'], data[i]['value'], data[i]['stockOrdered']);
        }

        itemTable.innerHTML= tableHTML;
    });
}

function itemOrderedCheckboxClicked(itemId: number) 
{
    const tableRow = document.getElementById(`tableRow_${itemId}`);
    const checkbox = tableRow.getElementsByClassName('orderedCheckbox')[0] as HTMLInputElement;

    if (checkbox.checked) {
        tableRow.classList.remove('table-active');
        updateItemOrderedStatus(itemId, false);
    } else {
        tableRow.classList.add('table-active');
        updateItemOrderedStatus(itemId, true);
    }

    checkbox.checked = !checkbox.checked;
}

function itemSelectClick(itemId: number)
{
    const result = selectedItems.find(item => {
        if ( String(item) === String(itemId) )
            return true;
        else 
            return false;
    });

    if (result) {
        selectedItems = selectedItems.filter(item => String(item) !== String(itemId));
    } else {
        selectedItems.push(itemId);
    }

    const deleteBtn = document.getElementById('deleteSelectedBtn');
    if (selectedItems.length > 0) {
        deleteBtn.classList.remove('d-none')
    } else {
        deleteBtn.classList.add('d-none')
    }

    event.stopPropagation();
}

async function updateItemOrderedStatus(itemId: number, stockOrdered: boolean)
{
    const request = new Request(`/updateItemOrderedStatus`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            itemId: itemId,
            stockOrdered: stockOrdered,
        }),
    })
    
    const response = await fetch(request);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP Error: Status ${response.status}, Message: ${errorData.message || 'Unknow err'}`);
    }
}

function createTableHeader(): string
{
    var tableHTML = `
        <thead>
            <td style="opacity: 50%; width: 5%"></td>
            <td style="opacity: 50%; width: 25%">Name</td>
            <td style="opacity: 50%; width: 25%; margin-left: 20px; padding: 20px">
            <div style="background-color: none; width: 25px; height: 25px; display: inline-block;"></div>
            Quantity
            </td>
            <td style="opacity: 50%;">Minimum Level</td>
            <td style="opacity: 50%; width: 15%">Price</td>
            <td style="opacity: 50%;">Value</td>
        </thead>
        `

    return tableHTML;
}

function createLowStockTableHeader(): string 
{
    var tableHTML = `
        <thead>
            <td style="opacity: 50%; width: 25%;">Name</td>
            
            <td style="opacity: 50%; width: 25%;">
            <div style="background-color: none; width: 25px; height: 25px; display: inline-block;"></div>
            Quantity
            </td>

            <td style="opacity: 50%; width: 15%;">Minimum Level</td>
            <td style="opacity: 50%;">Price</td>
            <td style="opacity: 50%;">Value</td>
            <td style="opacity: 50%; width: 10%;">Stock Ordered</td>
        </thead>
    `

    return tableHTML;
}

function createLowStockTableRowHTML(itemId: number, name: string, quantity: number, minimumLevel: number, price: number, value: number, stockOrdered: boolean): string
{
    let lowStockStyle = 'display: inline; background-color: green';
    let btnSize       = '25px';
    let isLowStock    = false;
    let tableActiveClass = '';
    let checked = '';

    // If below stock level show red background div
    if (Number(quantity) < Number(minimumLevel))
    {
        isLowStock = true;
        lowStockStyle = 'class="quantityDiv textBlockWithBGColor"';
    }
    else 
    {
        lowStockStyle = 'class="quantityDiv textBlockNoBGColor"';
    }

    if (stockOrdered) {
        tableActiveClass = 'table-active';
        checked = 'checked';
    } 

    const html = `
            <tr class="${tableActiveClass}" style="vertical-align: middle" id="tableRow_${itemId}" onmouseover="onMouseOverRow(${itemId}, ${isLowStock})" onmouseleave="onMouseLeaveRow(${itemId}, ${isLowStock})" onclick="itemOrderedCheckboxClicked(${itemId})" >
                <td class="nameRow">${name}</td>
                <td style="">
                    <div class="container" onclick="startEditingQuantity(${itemId})" style="">

                        <div style="background-color: transparent; display: inline-block; width: ${btnSize}; height: ${btnSize}">
                        <button style="display: none; width: 30px; height: 30px; padding: 0px;" class="btn btn-primary inventoryBtn" onclick="decrementQuantity(${itemId})">-</button>
                        </div>

                        <div ${lowStockStyle}>
                            <div class="quantityRow" style="display: inline; margin: 10px;" onclick="startEditingQuantity(${itemId})">
                            ${quantity}
                            </div>
                        </div>

                        <div style="background-color: transparent; display: inline-block; width: 30px; height: 30px;">
                        <button style="display: none; width: 30px; height: 30px; padding: 0px" class="btn btn-primary inventoryBtn" onclick="incrementQuantity(${itemId})">+</button>
                    </div>

                    <div>
                </td>
                <td class="minimumLevelRow">${minimumLevel}</td>

                <td>
                $<p class="priceRow" style="display: inline-block">${price}</p>
                </td>

                <td class="valueRow">$${value}</td>

                <td class="checkBoxRow" style="background-color: none; padding-left: 40px;">
                    <input type="checkbox" class="orderedCheckbox" value="Stock Ordered" onclick="itemOrderedCheckboxClicked(${itemId})" ${checked}></input>
                </td>
            </tr>
    `

    return html;
}

function createTableRowHTML(itemId: number, name: string, quantity: number, minimumLevel: number, price: number, value: number): string
{
    // If below stock level show red background div
    let lowStockStyle = 'display: inline; background-color: green';
    let btnSize = '25px';
    let isLowStock = false;

    if (Number(quantity) < Number(minimumLevel))
    {
        isLowStock = true;
        lowStockStyle = 'class="quantityDiv textBlockWithBGColor"';
    }
    else 
    {
        lowStockStyle = 'class="quantityDiv textBlockNoBGColor"';
    }

    const html = `
    
            <tr style="vertical-align: middle" id="tableRow_${itemId}" onmouseover="onMouseOverRow(${itemId}, ${isLowStock})" onmouseleave="onMouseLeaveRow(${itemId}, ${isLowStock})" onclick="openEditItemDialog(${itemId})" >

                <td class="checkboxRow">
                    <input type="checkbox" class="selectedCheckbox" value="" onclick="itemSelectClick(${itemId})" ></input>
                </td>

                <td class="nameRow">${name}</td>
                <td style="">
                    <div class="container" onclick="startEditingQuantity(${itemId})" style="">

                        <div style="background-color: transparent; display: inline-block; width: ${btnSize}; height: ${btnSize}">
                        <button style="display: none; width: 30px; height: 30px; padding: 0px;" class="btn btn-primary inventoryBtn" onclick="decrementQuantity(${itemId})">-</button>
                        </div>

                        <div ${lowStockStyle}>
                            <div class="quantityRow" style="display: inline; margin: 10px;" onclick="startEditingQuantity(${itemId})">
                            ${quantity}
                            </div>
                        </div>

                        <div style="background-color: transparent; display: inline-block; width: 30px; height: 30px;">
                        <button style="display: none; width: 30px; height: 30px; padding: 0px" class="btn btn-primary inventoryBtn" onclick="incrementQuantity(${itemId})">+</button>
                    </div>

                    <div>
                </td>
                <td class="minimumLevelRow">${minimumLevel}</td>

                <td>
                $<p class="priceRow" style="display: inline-block">${price}</p>
                </td>

                <td class="valueRow">$${value}</td>
            </tr>
    `

    return html;
}

async function readFileAsText(file) 
{
    return new Promise((resolve, reject) => 
    {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve(event.target.result);
        };

        reader.onerror = (event) => {
            console.log("error");
            reject(event.target.result);
        }

        reader.readAsText(file);
    })
}

async function showUploadDialog()
{
    $('#editItemModal').modal()

    popup.innerHTML = `
        <div class="modal-dialog">

        <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header">
            <h4 class="modal-title">Edit Item</h4>
            </div>
            <div class="modal-body">

                <div class="container">
                <div class="row">
                    <div class="col-md p-3" style="line-height: 1.8">
                    <input type="file" id="csvFileInput" accept=".csv">
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-between">
                <div class="">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                </div>
                <div class="">
                    <button type="button" class="btn btn-default" onclick="uploadCSV()">Upload</button>
                </div>
            </div>
        </div>
        
        </div>
    `
}

async function uploadCSV()
{
    const csvFileInput = document.getElementById('csvFileInput') as HTMLInputElement;
    const file = csvFileInput.files[0];

    if (!file) { return; }

    try {
        const fileData = await readFileAsText(file);

        const request = new Request("/uploadCSV", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                csvData: fileData
            }),
        })

        const response = await fetch(request);
    } catch (error) {
        console.log("error reading file: ", error);
    }

    $('#editItemModal').modal('hide');
    loadItemTable();
}

async function downloadCSV()
{
    console.log('test');
    
    const request = new Request(`/downloadCSV`, {
        method: "GET",
        headers: { 'Accept': 'text/plain' }
    })

    const response = await fetch(request);
    const data = response.text().then((data) => 
    {
        console.log('data: ', data);
        var blob = new Blob([data], { type: 'text/plain'});

        var a = document.createElement('a');
        a.download = 'test.txt';
        a.href = URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function() { URL.revokeObjectURL(a.href); }, 1500);
    });
}

async function loadTransactionLog()
{
    const request = new Request(`/getActivityLog`, {
        method: "GET",
        headers: { 'Content-Type': 'application/json' }
    })

    const response = await fetch(request);
    const data = response.json().then((data) => 
    {
        
        var tableHTML = `
            <thead>
                <td style="opacity: 50%;">Name</td>
                <td style="opacity: 50%;">Total Additions</td>
                <td style="opacity: 50%;">Total Subtractions</td>
            </thead>
        `

        let oldValue = 0;
        let newValue = 0;
        let transaction = 0;
        let quantityChangeSummaries: Array<QuanityChangeSummary> = [];

        for (let i=0; i<data.length; i++) 
        {
            oldValue = Number(data[i]['oldValue']);
            newValue = Number(data[i]['newValue']);
            transaction = oldValue - newValue;

            let alreadyAdded = false;
            for (let j=0; j<quantityChangeSummaries.length; j++) // Merge two tranctions if same item
            {
                if (quantityChangeSummaries[j].name == data[i]['itemName'])
                {
                    if (transaction > 0) {
                        quantityChangeSummaries[j].totalAdditions += transaction;
                    }
                    if (transaction < 0) {
                        quantityChangeSummaries[j].totalSubtactions += transaction;
                    }
                    alreadyAdded = true;
                }
            }

            // Add if not already added to list
            if (!alreadyAdded) 
            {
                let t = new QuanityChangeSummary();
                t.name = data[i]['itemName'];

                if (transaction > 0) {
                    t.totalAdditions += transaction;
                }
                if (transaction < 0) {
                    t.totalSubtactions += Math.abs(transaction);
                    
                }
                quantityChangeSummaries.push(t);
            }
        }

        // Sort items by total subtractions
        const sortItems = (itemA: QuanityChangeSummary, itemB: QuanityChangeSummary) => 
        {
            if (Math.abs(itemA.totalSubtactions) > Math.abs(itemB.totalSubtactions)) {
                return -1;
            } 
            else if (Math.abs(itemA.totalSubtactions) > Math.abs(itemB.totalSubtactions)) {
                return -1;
            } else {
                return 0;
            }
        };
        quantityChangeSummaries.sort(sortItems);

        // Add merged quantity change summaries
        for (let j=0; j<quantityChangeSummaries.length; j++) // Merge two tranctions if same item
        {
            const element = quantityChangeSummaries[j];
            const html = `
                    <tr style="vertical-align: middle" id="tableRow_">

                        <td class="typeRow">${quantityChangeSummaries[j].name}</td>
                        <td style=""> ${quantityChangeSummaries[j].totalAdditions}</td>
                        <td style=""> ${quantityChangeSummaries[j].totalSubtactions}</td>

                    </tr>
            `
            tableHTML += html;

            itemTable.innerHTML= tableHTML;
        }
    });
}

async function loadActivityLog()
{
    const request = new Request(`/getActivityLog`, {
        method: "GET",
        headers: { 'Content-Type': 'application/json' }
    })

    const response = await fetch(request);
    const data = response.json().then((data) => 
    {
        console.log(data);
        
        var tableHTML = `
            <thead>
                <td style="opacity: 50%; width: 30%;">Name</td>
                <td style="opacity: 50%; width: 15%;">Type</td>
                <td style="opacity: 50%; width: 20%;">Activity</td>
                <td style="opacity: 50%;">Time</td>
                <td style="opacity: 50%;">Date</td>
            </thead>
        `

        for (let i=0; i<data.length; i++) 
        {
            const quantityChange = Number(data[i]['oldValue']) - Number(data[i]['newValue']);
            const html = `
                    <tr style="vertical-align: middle" id="tableRow_">
                        <td class="typeRow">${data[i]['itemName']}</td>
                        <td class="typeRow">${data[i]['type']}</td>
                        <td> Quanity change:   ${quantityChange} </td>
                        <td> ${data[i]['time']} </td>
                        <td> ${data[i]['date']} </td>
                    </tr>
            `
            tableHTML += html;
        }

        itemTable.innerHTML= tableHTML;
    });
}