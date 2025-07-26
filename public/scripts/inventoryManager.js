var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class QuantityChangeTimer {
    constructor() {
        this.id = -1;
        this.itemId = -1;
        this.started = false;
        this.finalQuantity = 0;
    }
}
;
class Item {
    constructor() {
        this.name = '';
        this.itemId = -1;
        this.quantity = 0;
        this.minimumLevel = 0;
        this.price = 0;
        this.value = 0;
        this.barcode = 0;
        this.tags = '';
        this.notes = '';
        this.stockOrdered = false;
    }
}
class QuanityChangeSummary {
    constructor() {
        this.name = '';
        this.totalSubtactions = 0;
        this.totalAdditions = 0;
    }
}
const now = new Date();
const time = now.toTimeString();
// const date = now.toDateString();
// const date = now.toLocaleDateString();
// const date = now.date();
// console.log(date);
var LogType;
(function (LogType) {
    LogType[LogType["QUANTITY"] = 1] = "QUANTITY";
})(LogType || (LogType = {}));
// --- GLOBALS -----
var isEditingRow = false;
var searchBar = document.getElementById("searchBar");
const itemTable = document.getElementById("itemTable");
const popup = document.getElementById("editItemModal");
const editItemDialog = document.getElementById("editItemModal");
var quantityChangeTimer = new QuantityChangeTimer();
var selectedItems = [];
function showPopup(msg) {
    const popup = document.getElementById('msgPopup');
    popup.innerHTML = msg;
    popup.classList.remove('msgPopup-hide');
    popup.style.display = 'block';
    setTimeout(() => {
        popup.classList.add('msgPopup-hide');
    }, 1500);
}
function openNewItemDialog() {
    const popup = document.getElementById('editItemModal');
    $('#editItemModal').modal();
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
    `;
}
var Operation;
(function (Operation) {
    Operation[Operation["NONE"] = 0] = "NONE";
    Operation[Operation["ADD"] = 1] = "ADD";
    Operation[Operation["SUBTRACT"] = 2] = "SUBTRACT";
})(Operation || (Operation = {}));
function calculate(numA, numB, op) {
    if (op == Operation.SUBTRACT) {
        return numA - numB;
    }
    else if (op == Operation.ADD) {
        return numA + numB;
    }
    else {
        return null;
    }
}
function calculateInputField(inputData) {
    // If contains subtraction symbol do substration
    var initialInputData = inputData;
    var op = Operation.NONE;
    var nextOp = Operation.NONE;
    var element = '';
    var result = null;
    // Parse text input string
    for (let i = 0; i < inputData.length; i++) {
        if (isNaN(Number(inputData[i]))) // Check for operation symbol or non number
         {
            if (inputData[i] == '-') {
                if (op == Operation.NONE)
                    op = Operation.SUBTRACT;
                else
                    nextOp = Operation.SUBTRACT;
            }
            else if (inputData[i] == '+') {
                if (op == Operation.NONE)
                    op = Operation.ADD;
                else
                    nextOp = Operation.ADD;
            }
            else // Error
             {
                console.log('Error: text input contains invalid input');
                showPopup('Error: text input contains invalid input');
                return null;
            }
            if (result == null) // Check if two numbers can be calcuated together
             {
                result = Number(element);
                element = '';
            }
            else {
                result = calculate(result, Number(element), op);
                element = '';
                op = nextOp;
                nextOp = Operation.NONE;
            }
            continue;
        }
        element += inputData[i];
    }
    // If no equation just output the number
    if (op == Operation.NONE && nextOp == Operation.NONE) {
        if (isNaN(Number(inputData))) {
            result = null;
        }
        else {
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
function openEditItemDialog(itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('opening');
        if (isEditingRow) {
            return;
        }
        console.log('goto item', itemId);
        itemId = itemId;
        const request = new Request(`/getItemById/${itemId}`, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' }
        });
        const response = yield fetch(request);
        const data = response.json().then((data) => {
            console.log('data: ', data);
            if (data.length <= 0) {
                console.log('Error. data is empty');
                return;
            }
            $('#editItemModal').modal();
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
        `;
            // Update item value when quanity changes
            const quantityInput = document.getElementById('quantityInput');
            const initialValue = quantityInput.value;
            // On key up
            quantityInput.addEventListener('keyup', (event) => {
                const input = document.getElementById('quantityInput');
                console.log(input.value);
                if (event.key == 'Enter') {
                    const result = calculateInputField(input.value);
                    if (result == null)
                        input.value = initialValue;
                    else
                        input.value = String(result);
                }
                if (typeof Number(input.value) === 'number' && !isNaN(Number(input.value))) {
                    const price = document.getElementById('priceInput').value;
                    const quantity = Number(input.value);
                    const value = Number(price) * quantity;
                    const valueText = document.getElementById('valueText');
                    valueText.innerHTML = Number(value).toFixed(2);
                }
                else {
                    const msg = 'Quanity isnt number';
                    document.getElementById('valueText').innerHTML = msg;
                }
            });
            // Update item value when price changes
            const priceInput = document.getElementById('priceInput');
            priceInput.addEventListener('keyup', () => {
                const input = document.getElementById('priceInput');
                if (typeof Number(input.value) === 'number' && !isNaN(Number(input.value))) {
                    const price = Number(input.value);
                    const quantity = Number(document.getElementById('quantityInput').value);
                    const value = price * quantity;
                    const valueText = document.getElementById('valueText');
                    valueText.innerHTML = Number(value).toFixed(2);
                }
                else {
                    const msg = 'Price isnt number';
                    const priceInput = document.getElementById('valueText').innerHTML = msg;
                }
            });
        });
    });
}
function getHTMLInputById(id) {
    return document.getElementById(id);
}
function addItem() {
    return __awaiter(this, void 0, void 0, function* () {
        const itemName = getHTMLInputById('nameInput').value;
        const itemQuantity = getHTMLInputById('quantityInput').value;
        const itemMinQuantity = getHTMLInputById('minQuantityInput').value;
        const itemPrice = getHTMLInputById('priceInput').value;
        const itemValue = getHTMLInputById('valueInput').value;
        const itemBarcode = getHTMLInputById('barcodeInput').value;
        const itemNotes = getHTMLInputById('notesInput').value;
        const itemTags = getHTMLInputById('tagsInput').value;
        const request = new Request(`/addItem`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                itemName: itemName,
                itemQuantity: itemQuantity,
                itemMinQuantity: itemMinQuantity,
                itemPrice: itemPrice,
                itemValue: itemValue,
                itemBarcode: itemBarcode,
                itemNotes: itemNotes,
                itemTags: itemTags,
            }),
        });
        const response = yield fetch(request);
        if (!response.ok) {
            const errorData = yield response.json();
            throw new Error(`HTTP Error: Status ${response.status}, Message: ${errorData.message || 'Unknow err'}`);
        }
        $('#editItemModal').modal('hide');
    });
}
function deleteItem(itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        const item = yield getItemById(itemId);
        const name = item[0].name;
        const request = new Request(`/deleteItem`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                itemId: itemId,
            }),
        });
        const response = yield fetch(request);
        if (!response.ok) {
            const errorData = yield response.json();
            throw new Error(`HTTP Error: Status ${response.status}, Message: ${errorData.message || 'Unknow err'}`);
        }
        $('#editItemModal').modal('hide');
        loadItemTable();
        const msg = 'Item: ' + name + ' deleted.';
        showPopup(msg);
    });
}
function deleteSelectedItems() {
    return __awaiter(this, void 0, void 0, function* () {
        const request = new Request(`/deleteArrayOfItems`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: selectedItems,
            }),
        });
        const response = yield fetch(request);
        if (!response.ok) {
            const errorData = yield response.json();
            throw new Error(`HTTP Error: Status ${response.status}, Message: ${errorData.message || 'Unknow err'}`);
        }
        loadItemTable();
        showPopup('Deleted selected items');
    });
}
function showDeleteAllPrompt() {
    $('#editItemModal').modal();
    popup.innerHTML = `
        <div class="modal-dialog" style="width: 400px">

        <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header">
            <h4 class="modal-title">Confirmation</h4>
            </div>
            <div class="modal-body">
                Are you sure you want to delete all items?
                <br>
                <br>
                <div class="d-flex flex-row-reverse">
                    <div class="px-2">
                        <button type="button" class="btn btn-primary inventoryBtn" data-dismiss="modal">Close</button>
                    </div>
                    <div class="px-2">
                        <button type="button" class="btn btn-primary inventoryBtn" onclick="deleteAllItems()">Confirm</button>
                    </div>
                </div>
            </div>

        </div>
        
        </div>
    `;
}
function deleteAllItems() {
    return __awaiter(this, void 0, void 0, function* () {
        const request = new Request(`/deleteAllItems`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });
        const response = yield fetch(request).then(() => {
            loadItemTable();
            showPopup('Deleted all items');
        });
    });
}
function getItemById(itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        const request = new Request(`/getItemById/${itemId}`, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' }
        });
        const response = yield fetch(request);
        const data = yield response.json().then((data) => {
            return data;
        });
        return data;
    });
}
function getItemJson(itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('hello');
        const request = new Request(`/getItemById/${itemId}`, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' }
        });
        const response = yield fetch(request);
        const data = yield response.json().then((data) => {
            const s = JSON.stringify(data[0]);
            console.log(JSON.parse(s));
            return data;
        });
    });
}
function getItemNameById(itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        const request = new Request(`/getItemById/${itemId}`, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' }
        });
        const response = yield fetch(request);
        const data = yield response.json().then((data) => {
            return data;
        });
        return data.name;
    });
}
function updateItem(itemData) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('upate item');
        const item = yield getItemById(itemData.itemId);
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
        });
        const response = yield fetch(request);
        if (!response.ok) {
            const errorData = yield response.json();
            throw new Error(`HTTP Error: Status ${response.status}, Message: ${errorData.message || 'Unknow err'}`);
        }
    });
}
function editItemDialogUpdate(itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        const itemName = getHTMLInputById('nameInput').value;
        const itemQuantity = Number(getHTMLInputById('quantityInput').value);
        const itemMinQuantity = Number(getHTMLInputById('minimumLevelInput').value);
        const itemPrice = Number(getHTMLInputById('priceInput').value);
        const itemBarcode = getHTMLInputById('barcodeInput').value;
        const itemNotes = getHTMLInputById('notesInput').value;
        const itemTags = getHTMLInputById('tagsInput').value;
        const request = new Request(`/edit/${itemId}`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                itemName: itemName,
                itemQuantity: itemQuantity,
                itemMinQuantity: itemMinQuantity,
                itemPrice: itemPrice,
                itemBarcode: itemBarcode,
                itemNotes: itemNotes,
                itemTags: itemTags,
            }),
        });
        const response = yield fetch(request);
        if (!response.ok) {
            const errorData = yield response.json();
            throw new Error(`HTTP Error: Status ${response.status}, Message: ${errorData.message || 'Unknow err'}`);
        }
        $('#editItemModal').modal('hide');
        const tableRow = document.getElementById(`tableRow_${itemId}`);
        const itemValue = Number(itemQuantity) * Number(itemPrice);
        tableRow.innerHTML = createTableRowHTML(itemId, itemName, itemQuantity, itemMinQuantity, itemPrice, itemValue);
    });
}
function editPopupDecreaseQuantity() {
    const qualityInput = getHTMLInputById('quantityInput');
    console.log(qualityInput, qualityInput.value);
    qualityInput.value = String(Number(qualityInput.value) - 1);
    if (Number(qualityInput.value) < 0)
        qualityInput.value = String(0);
}
function editInputFieldNum(inputId, numberAdjustment) {
    const inputField = getHTMLInputById(inputId);
    inputField.value = Number(inputField.value) + numberAdjustment;
    if (Number(inputField.value) < 0)
        inputField.value = String(0);
}
function editPopUpAdjustQuantity(numberAdjustment) {
    editInputFieldNum('quantityInput', numberAdjustment);
    const price = getHTMLInputById('priceInput').value;
    const quantity = getHTMLInputById('quantityInput').value;
    const value = Number(price) * Number(quantity);
    const priceInput = document.getElementById('valueText');
    priceInput.innerHTML = Number(value).toFixed(2);
}
function incrementQuantity(itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        event.stopPropagation();
        const tableRow = document.getElementById(`tableRow_${itemId}`);
        const quantity = Number(tableRow.getElementsByClassName('quantityRow')[0].innerHTML);
        const price = Number(tableRow.getElementsByClassName('priceRow')[0].innerHTML);
        var newQuantity = quantity + 1;
        let value = Number(price * quantity);
        tableRow.getElementsByClassName("quantityRow")[0].innerHTML = String(newQuantity);
        tableRow.getElementsByClassName("valueRow")[0].innerHTML = "$" + value.toFixed(2);
        sendQuantityChangeToTimer(itemId, newQuantity);
    });
}
function decrementQuantity(itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        event.stopPropagation();
        const tableRow = document.getElementById(`tableRow_${itemId}`);
        const quantity = Number(tableRow.getElementsByClassName('quantityRow')[0].innerHTML);
        const price = Number(tableRow.getElementsByClassName('priceRow')[0].innerHTML);
        var newQuantity = quantity - 1;
        if (newQuantity < 0) {
            newQuantity = 0;
        }
        let value = Number(price * quantity);
        tableRow.getElementsByClassName("quantityRow")[0].innerHTML = String(newQuantity);
        tableRow.getElementsByClassName("valueRow")[0].innerHTML = "$" + value.toFixed(2);
        sendQuantityChangeToTimer(itemId, newQuantity);
    });
}
function sendQuantityChangeToTimer(itemId, newQuantity) {
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
    quantityChangeTimer.id = window.setTimeout(() => __awaiter(this, void 0, void 0, function* () {
        quantityChangeTimer.started = false;
        // submit edit request
        const item = yield getItemById(quantityChangeTimer.itemId);
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
        });
        const response = yield fetch(request);
        if (!response.ok) {
            const errorData = yield response.json();
            throw new Error(`HTTP Error: Status ${response.status}, Message: ${errorData.message || 'Unknow err'}`);
        }
    }), 500);
}
function onMouseOverRow(itemId, isLowStock) {
    const tableRow = document.getElementById(`tableRow_${itemId}`);
    const buttons = tableRow.getElementsByTagName('button');
    const lowStockDiv = tableRow.getElementsByClassName('quantityDiv')[0];
    if (isLowStock) {
        lowStockDiv.classList.remove('textBlockWithBGColor');
        lowStockDiv.classList.add('textBlockNoBGColor');
    }
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].style.display = 'inline-block';
    }
}
function onMouseLeaveRow(itemId, isLowStock) {
    const tableRow = document.getElementById(`tableRow_${itemId}`);
    const buttons = tableRow.getElementsByTagName('button');
    const lowStockDiv = tableRow.getElementsByClassName('quantityDiv')[0];
    if (isLowStock) {
        lowStockDiv.classList.add('textBlockWithBGColor');
        lowStockDiv.classList.remove('textBlockNoBGColor');
    }
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].style.display = 'none';
    }
}
function onRowLoseFocus(itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isEditingRow == false) {
            return;
        }
        const item = yield getItemById(itemId);
        const tableRow = document.getElementById(`tableRow_${itemId}`);
        const name = tableRow.getElementsByClassName("nameRow")[0].innerHTML;
        const quantity = item[0]['quantity'];
        const minimumLevel = tableRow.getElementsByClassName("minimumLevelRow")[0].innerHTML;
        const price = tableRow.getElementsByClassName("priceRow")[0].innerHTML;
        const value = tableRow.getElementsByClassName("valueRow")[0].innerHTML;
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
        });
        const response = yield fetch(request);
        if (!response.ok) {
            const errorData = yield response.json();
            throw new Error(`HTTP Error: Status ${response.status}, Message: ${errorData.message || 'Unknow err'}`);
        }
        changeRowStateToDefaultView(itemId);
    });
}
function startEditingQuantity(itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        event.stopPropagation();
        changeRowStateToEditQuantity(itemId);
    });
}
function changeRowStateToDefaultView(itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        isEditingRow = false;
        const item = yield getItemById(itemId);
        const name = item[0]['name'];
        const quantity = item[0]['quantity'];
        const minimumLevel = item[0]['minimumLevel'];
        const price = item[0]['price'];
        const value = item[0]['value'];
        const tableRow = document.getElementById(`tableRow_${itemId}`);
        const elem = tableRow.getElementsByClassName('quantityDiv')[0];
        elem.innerHTML = `
             <div class="quantityRow" style="display: inline; margin: 10px;" onclick="startEditingQuantity(${itemId})">
            ${quantity}
            </div>
    `;
    });
}
function changeRowStateToEditQuantity(itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        isEditingRow = true;
        const item = yield getItemById(itemId);
        const tableRow = document.getElementById(`tableRow_${itemId}`);
        const name = item[0]['name'];
        const quantity = item[0]['quantity'];
        const minimumLevel = item[0]['minimumLevel'];
        const price = item[0]['price'];
        const value = item[0]['value'];
        const elem = tableRow.getElementsByClassName('quantityDiv')[0];
        elem.innerHTML = `
            <input type="text" class="quantityRow" id="tempInput" value="${quantity}" size="6" onblur="onRowLoseFocus(${itemId})" style="align-text: center;"></input>
    `;
        const quantityInput = getHTMLInputById('tempInput');
        const initialValue = quantityInput.value;
        quantityInput.addEventListener('keydown', function (event) {
            if (event.key == 'Enter') {
                const input = getHTMLInputById('tempInput');
                const result = calculateInputField(input.value);
                isEditingRow = false;
                if (result == null)
                    input.value = initialValue;
                else
                    input.value = String(result);
                const tableRow = document.getElementById(`tableRow_${itemId}`);
                const item = new Item();
                item.itemId = itemId;
                item.name = tableRow.getElementsByClassName("nameRow")[0].innerHTML;
                item.quantity = Number(result);
                item.minimumLevel = Number(tableRow.getElementsByClassName("minimumLevelRow")[0].innerHTML);
                item.price = Number(tableRow.getElementsByClassName("priceRow")[0].innerHTML);
                item.value = Number(tableRow.getElementsByClassName("valueRow")[0].innerHTML);
                updateItem(item);
                const elem = tableRow.getElementsByClassName('quantityDiv')[0];
                elem.innerHTML = `
                    <div class="quantityRow" style="display: inline; margin: 10px;" onclick="startEditingQuantity(${itemId})">
                    ${result}
                    </div>
            `;
                event.preventDefault();
            }
            if (event.key == "Escape") {
                changeRowStateToDefaultView(itemId);
                event.preventDefault();
            }
        });
        const textInput = getHTMLInputById("tempInput");
        textInput.focus();
        const textLength = textInput.value.length;
        textInput.setSelectionRange(textLength, textLength);
    });
}
function searchForLowStockItem(name) {
    return __awaiter(this, void 0, void 0, function* () {
        if (name == "") {
            name = "all";
        }
        const request = new Request(`/searchLowStock/${name}`, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' }
        });
        const response = yield fetch(request);
        const data = response.json().then((data) => {
            console.log(data);
            var tableHTML = createLowStockTableHeader();
            for (let i = 0; i < data.length; i++) {
                tableHTML += createTableRowHTML(data[i]['id'], data[i]['name'], data[i]['quantity'], data[i]['minimumLevel'], data[i]['price'], data[i]['value']);
            }
            itemTable.innerHTML = tableHTML;
        });
    });
}
function searchForItem(name) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('search?');
        if (name == "") {
            name = "all";
        }
        const request = new Request(`/search/${name}`, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' }
        });
        const response = yield fetch(request);
        const data = response.json().then((data) => {
            console.log(data);
            var tableHTML = createTableHeader();
            for (let i = 0; i < data.length; i++) {
                tableHTML += createTableRowHTML(data[i]['id'], data[i]['name'], data[i]['quantity'], data[i]['minimumLevel'], data[i]['price'], data[i]['value']);
            }
            itemTable.innerHTML = tableHTML;
        });
    });
}
function loadItemTable() {
    return __awaiter(this, void 0, void 0, function* () {
        const request = new Request(`/search/all`, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' }
        });
        const response = yield fetch(request);
        const data = response.json().then((data) => {
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
        `;
            for (let i = 0; i < data.length; i++) {
                tableHTML += createTableRowHTML(data[i]['id'], data[i]['name'], data[i]['quantity'], data[i]['minimumLevel'], data[i]['price'], data[i]['value']);
            }
            itemTable.innerHTML = tableHTML;
            getItemJson(6051);
        });
    });
}
function loadLowStockItemTable() {
    return __awaiter(this, void 0, void 0, function* () {
        const request = new Request(`/lowStockItems`, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' }
        });
        const response = yield fetch(request);
        const data = response.json().then((data) => {
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
        `;
            for (let i = 0; i < data.length; i++) {
                tableHTML += createLowStockTableRowHTML(data[i]['id'], data[i]['name'], data[i]['quantity'], data[i]['minimumLevel'], data[i]['price'], data[i]['value'], data[i]['stockOrdered']);
            }
            itemTable.innerHTML = tableHTML;
        });
    });
}
function itemOrderedCheckboxClicked(itemId) {
    const tableRow = document.getElementById(`tableRow_${itemId}`);
    const checkbox = tableRow.getElementsByClassName('orderedCheckbox')[0];
    if (checkbox.checked) {
        tableRow.classList.remove('table-active');
        updateItemOrderedStatus(itemId, false);
    }
    else {
        tableRow.classList.add('table-active');
        updateItemOrderedStatus(itemId, true);
    }
    checkbox.checked = !checkbox.checked;
}
function itemSelectClick(itemId) {
    const result = selectedItems.find(item => {
        if (String(item) === String(itemId))
            return true;
        else
            return false;
    });
    if (result) {
        selectedItems = selectedItems.filter(item => String(item) !== String(itemId));
    }
    else {
        selectedItems.push(itemId);
    }
    const deleteBtn = document.getElementById('deleteSelectedBtn');
    if (selectedItems.length > 0) {
        deleteBtn.classList.remove('d-none');
    }
    else {
        deleteBtn.classList.add('d-none');
    }
    event.stopPropagation();
}
function updateItemOrderedStatus(itemId, stockOrdered) {
    return __awaiter(this, void 0, void 0, function* () {
        const request = new Request(`/updateItemOrderedStatus`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                itemId: itemId,
                stockOrdered: stockOrdered,
            }),
        });
        const response = yield fetch(request);
        if (!response.ok) {
            const errorData = yield response.json();
            throw new Error(`HTTP Error: Status ${response.status}, Message: ${errorData.message || 'Unknow err'}`);
        }
    });
}
function createTableHeader() {
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
        `;
    return tableHTML;
}
function createLowStockTableHeader() {
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
    `;
    return tableHTML;
}
function createLowStockTableRowHTML(itemId, name, quantity, minimumLevel, price, value, stockOrdered) {
    let lowStockStyle = 'display: inline; background-color: green';
    let btnSize = '25px';
    let isLowStock = false;
    let tableActiveClass = '';
    let checked = '';
    // If below stock level show red background div
    if (Number(quantity) < Number(minimumLevel)) {
        isLowStock = true;
        lowStockStyle = 'class="quantityDiv textBlockWithBGColor"';
    }
    else {
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
    `;
    return html;
}
function createTableRowHTML(itemId, name, quantity, minimumLevel, price, value) {
    // If below stock level show red background div
    let lowStockStyle = 'display: inline; background-color: green';
    let btnSize = '25px';
    let isLowStock = false;
    if (Number(quantity) < Number(minimumLevel)) {
        isLowStock = true;
        lowStockStyle = 'class="quantityDiv textBlockWithBGColor"';
    }
    else {
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
    `;
    return html;
}
function readFileAsText(file) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            reader.onerror = (event) => {
                console.log("error");
                reject(event.target.result);
            };
            reader.readAsText(file);
        });
    });
}
function showUploadDialog() {
    return __awaiter(this, void 0, void 0, function* () {
        $('#editItemModal').modal();
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
    `;
    });
}
function uploadCSV() {
    return __awaiter(this, void 0, void 0, function* () {
        const csvFileInput = document.getElementById('csvFileInput');
        const file = csvFileInput.files[0];
        if (!file) {
            return;
        }
        try {
            const fileData = yield readFileAsText(file);
            const request = new Request("/uploadCSV", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    csvData: fileData
                }),
            });
            const response = yield fetch(request);
        }
        catch (error) {
            console.log("error reading file: ", error);
        }
        $('#editItemModal').modal('hide');
        loadItemTable();
    });
}
function downloadCSV() {
    return __awaiter(this, void 0, void 0, function* () {
        const request = new Request(`/downloadCSV`, {
            method: "GET",
            headers: { 'Accept': 'text/plain' }
        });
        const response = yield fetch(request);
        const data = response.text().then((data) => {
            console.log('data: ', data);
            var blob = new Blob([data], { type: 'text/plain' });
            var a = document.createElement('a');
            a.download = 'items.csv';
            a.href = URL.createObjectURL(blob);
            a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
        });
    });
}
function loadTransactionLog() {
    return __awaiter(this, void 0, void 0, function* () {
        const request = new Request(`/getActivityLog`, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' }
        });
        const response = yield fetch(request);
        const data = response.json().then((data) => {
            var tableHTML = `
            <thead>
                <td style="opacity: 50%;">Name</td>
                <td style="opacity: 50%;">Total Additions</td>
                <td style="opacity: 50%;">Total Subtractions</td>
            </thead>
        `;
            let oldValue = 0;
            let newValue = 0;
            let transaction = 0;
            let quantityChangeSummaries = [];
            for (let i = 0; i < data.length; i++) {
                oldValue = Number(data[i]['oldValue']);
                newValue = Number(data[i]['newValue']);
                transaction = oldValue - newValue;
                let alreadyAdded = false;
                for (let j = 0; j < quantityChangeSummaries.length; j++) // Merge two tranctions if same item
                 {
                    if (quantityChangeSummaries[j].name == data[i]['itemName']) {
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
                if (!alreadyAdded) {
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
            const sortItems = (itemA, itemB) => {
                if (Math.abs(itemA.totalSubtactions) > Math.abs(itemB.totalSubtactions)) {
                    return -1;
                }
                else if (Math.abs(itemA.totalSubtactions) > Math.abs(itemB.totalSubtactions)) {
                    return -1;
                }
                else {
                    return 0;
                }
            };
            quantityChangeSummaries.sort(sortItems);
            // Add merged quantity change summaries
            for (let j = 0; j < quantityChangeSummaries.length; j++) // Merge two tranctions if same item
             {
                const element = quantityChangeSummaries[j];
                const html = `
                    <tr style="vertical-align: middle" id="tableRow_">

                        <td class="typeRow">${quantityChangeSummaries[j].name}</td>
                        <td style=""> ${quantityChangeSummaries[j].totalAdditions}</td>
                        <td style=""> ${quantityChangeSummaries[j].totalSubtactions}</td>

                    </tr>
            `;
                tableHTML += html;
                itemTable.innerHTML = tableHTML;
            }
        });
    });
}
function loadActivityLog() {
    return __awaiter(this, void 0, void 0, function* () {
        const request = new Request(`/getActivityLog`, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' }
        });
        const response = yield fetch(request);
        const data = response.json().then((data) => {
            console.log(data);
            var tableHTML = `
            <thead>
                <td style="opacity: 50%; width: 30%;">Name</td>
                <td style="opacity: 50%; width: 15%;">Type</td>
                <td style="opacity: 50%; width: 20%;">Activity</td>
                <td style="opacity: 50%;">Time</td>
                <td style="opacity: 50%;">Date</td>
            </thead>
        `;
            for (let i = 0; i < data.length; i++) {
                let html = '';
                switch (data[i]['type']) {
                    case 'quantity':
                        {
                            const quantityChange = Number(data[i]['oldValue']) - Number(data[i]['newValue']);
                            html = `
                            <tr style="vertical-align: middle" id="tableRow_">
                                <td class="typeRow">${data[i]['itemName']}</td>
                                <td class="typeRow">${data[i]['type']}</td>
                                <td> Quanity change:   ${quantityChange} </td>
                                <td> ${data[i]['time']} </td>
                                <td> ${data[i]['date']} </td>
                            </tr>
                    `;
                            break;
                        }
                    case 'delete all':
                        {
                            html = `
                            <tr style="vertical-align: middle" id="tableRow_">
                                <td class="typeRow">Delete All</td>
                                <td class="typeRow">${data[i]['type']}</td>
                                <td> Delete all items </td>
                                <td> ${data[i]['time']} </td>
                                <td> ${data[i]['date']} </td>
                            </tr>
                    `;
                            break;
                        }
                }
                tableHTML += html;
            }
            itemTable.innerHTML = tableHTML;
        });
    });
}
function undoCommand() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('trying to undo command.');
        const request = new Request(`/undoCommand`, {
            method: "GET",
            headers: { 'Accept': 'text/plain' }
        });
        const response = yield fetch(request);
        const data = response.text().then((data) => {
            window.setTimeout(() => {
                console.log('timeout');
                loadItemTable();
            }, 100);
            showPopup(data);
        });
    });
}
//# sourceMappingURL=inventoryManager.js.map