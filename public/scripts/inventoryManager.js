function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _ts_generator(thisArg, body) {
    var f, y, t, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(g && (g = 0, op[0] && (_ = 0)), _)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
var QuantityChangeTimer = function QuantityChangeTimer() {
    "use strict";
    _class_call_check(this, QuantityChangeTimer);
    _define_property(this, "id", -1);
    _define_property(this, "itemId", -1);
    _define_property(this, "started", false);
    _define_property(this, "finalQuantity", 0);
};
var Item = function Item() {
    "use strict";
    _class_call_check(this, Item);
    _define_property(this, "name", '');
    _define_property(this, "itemId", -1);
    _define_property(this, "quantity", 0);
    _define_property(this, "minimumLevel", 0);
    _define_property(this, "price", 0);
    _define_property(this, "value", 0);
    _define_property(this, "barcode", 0);
    _define_property(this, "tags", '');
    _define_property(this, "notes", '');
};
var QuanityChangeSummary = function QuanityChangeSummary() {
    "use strict";
    _class_call_check(this, QuanityChangeSummary);
    _define_property(this, "name", '');
    _define_property(this, "totalSubtactions", 0);
    _define_property(this, "totalAdditions", 0);
};
var LogType = /*#__PURE__*/ function(LogType) {
    LogType[LogType["QUANTITY"] = 1] = "QUANTITY";
    return LogType;
}(LogType || {});
// --- GLOBALS -----
var isEditingRow = false;
var searchBar = document.getElementById("searchBar");
var itemTable = document.getElementById("itemTable");
var popup = document.getElementById("editItemModal");
var editItemDialog = document.getElementById("editItemModal");
var quantityChangeTimer = new QuantityChangeTimer();
function showPopup(msg) {
    var popup = document.getElementById('msgPopup');
    popup.innerHTML = msg;
    popup.classList.remove('msgPopup-hide');
    popup.style.display = 'block';
    setTimeout(function() {
        popup.classList.add('msgPopup-hide');
    }, 1500);
}
function openNewItemDialog() {
    var popup = document.getElementById('editItemModal');
    $('#editItemModal').modal();
    popup.innerHTML = '\n        <div class="modal-dialog">\n\n        <!-- Modal content-->\n        <div class="modal-content">\n            <div class="modal-header">\n            <h4 class="modal-title">Edit Item</h4>\n            </div>\n            <div class="modal-body">\n\n                <div class="container">\n                <div class="row">\n                    <div class="col-md p-3" style="line-height: 1.8">\n                    Name: <br>\n                    Quantity: <br>\n                    Minimum Level: <br>\n                    Price: <br>\n                    Value: <br>\n                    Barcode: <br>\n                    </div>\n                    <div class="col-sm">\n                        <input type="text" id="nameInput" ></input> <br>\n                        <input type="text" id="quantityInput"  ></input> <br>\n                        <input type="text" id="minQuantityInput" ></input> <br>\n                        <input type="text" id="priceInput" ></input> <br>\n                        <input type="text" id="valueInput" ></input> <br>\n                        <input type="text" id="barcodeInput" ></input> <br>\n                        <input type="text" id="notesInput" ></input> <br>\n                        <input type="text" id="tagsInput" ></input> <br>\n                    </div>\n                </div>\n            </div>\n            <div class="modal-footer">\n            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n            <button type="button" class="btn btn-default" onclick="addItem()">Save</button>\n\n            </div>\n        </div>\n        \n        </div>\n    ';
}
var Operation = /*#__PURE__*/ function(Operation) {
    Operation[Operation["NONE"] = 0] = "NONE";
    Operation[Operation["ADD"] = 1] = "ADD";
    Operation[Operation["SUBTRACT"] = 2] = "SUBTRACT";
    return Operation;
}(Operation || {});
function calculate(numA, numB, op) {
    if (op == 2) {
        return numA - numB;
    } else if (op == 1) {
        return numA + numB;
    } else {
        return null;
    }
}
function calculateInputField(inputData) {
    // If contains subtraction symbol do substration
    var initialInputData = inputData;
    var op = 0;
    var nextOp = 0;
    var element = '';
    var result = null;
    // Parse text input string
    for(var i = 0; i < inputData.length; i++){
        if (isNaN(Number(inputData[i]))) {
            if (inputData[i] == '-') {
                if (op == 0) op = 2;
                else nextOp = 2;
            } else if (inputData[i] == '+') {
                if (op == 0) op = 1;
                else nextOp = 1;
            } else {
                console.log('Error: text input contains invalid input');
                showPopup('Error: text input contains invalid input');
                return null;
            }
            if (result == null) {
                result = Number(element);
                element = '';
            } else {
                result = calculate(result, Number(element), op);
                element = '';
                op = nextOp;
                nextOp = 0;
            }
            continue;
        }
        element += inputData[i];
    }
    // Done parsing so check to see if there's one more number to add to caclulation
    if (result && element != '') {
        result = calculate(result, Number(element), op);
        if (result == null) console.log("error calculating");
    }
    return result;
}
function openEditItemDialog(itemId) {
    return _async_to_generator(function() {
        var request, response, data;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    console.log('opening');
                    if (isEditingRow) {
                        return [
                            2
                        ];
                    }
                    console.log('goto item', itemId);
                    itemId = itemId;
                    request = new Request("/getItemById/".concat(itemId), {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    return [
                        4,
                        fetch(request)
                    ];
                case 1:
                    response = _state.sent();
                    data = response.json().then(function(data) {
                        console.log('data: ', data);
                        if (data.length <= 0) {
                            console.log('Error. data is empty');
                            return;
                        }
                        $('#editItemModal').modal();
                        editItemDialog.innerHTML = '\n            <div class="modal-dialog">\n\n            <!-- Modal content-->\n            <div class="modal-content">\n                <div class="modal-header">\n                <h4 class="modal-title">Edit Item</h4>\n                </div>\n                <div class="modal-body">\n\n                    <div class="row" style="font-family: var(--primary-font);">\n                        <div class="col-md" style="line-height: 3;">\n                        </div>\n                        <div class="col-sm" style="line-height: 3;">\n                        </div>\n                    </div>\n\n                    <div class="row" style="font-family: var(--primary-font);">\n                        <div class="col-4"  style="line-height: 3;">\n                            Name:  <br>\n                            Quantity: <br>\n                            Minimum Level: <br>\n                            Price: <br>\n                            Tags: <br>\n                            Barcode: <br>\n                            Notes:\n                        </div>\n                        <div class="col-8" style="line-height: 3;">\n                            <input type="text" id="nameInput" value="'.concat(data[0]['name'], '" class="editInput" style="height: 40px; width: 300px"></input> \n                            <br>\n\n                            <button style="width: 40px; height: 40px; padding: 0px" class="btn btn-primary inventoryBtn" onclick="editPopUpAdjustQuantity(-1)">-</button>\n                            <input type="text" id="quantityInput" value="').concat(data[0]['quantity'], '" class="editInput" style="height: 40px; width: 150px" autocomplete="off"></input> \n                            <button style="width: 40px; height: 40px; padding: 0px" class="btn btn-primary inventoryBtn" onclick="editPopUpAdjustQuantity(1)">+</button>\n                            <br>\n\n                            <button style="width: 40px; height: 40px; padding: 0px" class="btn btn-primary inventoryBtn" onclick="editInputFieldNum(\'minimumLevelInput\', -1)">-</button>\n                            <input type="text" id="minimumLevelInput" value="').concat(data[0]['minimumLevel'], '" class="editInput" style="height: 40px; width: 150px"></input> \n                            <button style="width: 40px; height: 40px; padding: 0px" class="btn btn-primary inventoryBtn" onclick="editInputFieldNum(\'minimumLevelInput\', 1)">+</button>\n                            <br>\n\n                            <input type="text" id="priceInput" value="').concat(data[0]['price'], '" class="editInput" style="height: 40px; width: 150px"></input> \n\n                            <p style="display: inline; padding-left:20px;">Value: <b id="valueText" class="enhancedText">').concat(data[0]['value'], '</b></p>\n\n                            <input type="text" id="tagsInput" value="').concat(data[0]['tags'], '" class="editInput" style="height: 40px; width: 300px"></input> \n\n                            <input type="text" id="barcodeInput" value="').concat(data[0]['barcode'], '" class="editInput" style="height: 40px; width: 300px"></input> \n\n                            <textarea id="notesInput" value="').concat(data[0]['notes'], ' rows="5" col="100" class="editInput" style="width: 300px">').concat(data[0]['notes'], '</textarea>\n                        </div>\n                    </div>\n\n                    <div class="row" style="font-family: var(--primary-font);">\n                        <div class="col-md"  style="line-height: 3;">\n                        </div>\n                    </div>\n\n                    <div class="d-flex justify-content-between">\n                        <div class="">\n                        <button type="button" class="btn btn-primary inventoryBtn" data-dismiss="modal">Close</button>\n                        </div>\n                        <div class="">\n                        <button type="button" class="btn btn-primary inventoryBtn" data-dismiss="modal" onclick="deleteItem(').concat(data[0]['id'], ')">Delete</button>\n                        <button type="button" class="btn btn-primary inventoryBtn" onclick="editItemDialogUpdate(').concat(data[0]['id'], ')">Save</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        ');
                        // Update item value when quanity changes
                        var quantityInput = document.getElementById('quantityInput');
                        var initialValue = quantityInput.value;
                        // On key up
                        quantityInput.addEventListener('keyup', function(event1) {
                            var input = document.getElementById('quantityInput');
                            console.log(input.value);
                            if (event1.key == 'Enter') {
                                var result = calculateInputField(input.value);
                                if (result == null) input.value = initialValue;
                                else input.value = String(result);
                            }
                            if (typeof Number(input.value) === 'number' && !isNaN(Number(input.value))) {
                                var price = document.getElementById('priceInput').value;
                                var quantity = Number(input.value);
                                var value = Number(price) * quantity;
                                var valueText = document.getElementById('valueText');
                                valueText.innerHTML = Number(value).toFixed(2);
                            } else {
                                var msg = 'Quanity isnt number';
                                document.getElementById('valueText').innerHTML = msg;
                            }
                        });
                        // Update item value when price changes
                        var priceInput = document.getElementById('priceInput');
                        priceInput.addEventListener('keyup', function() {
                            var input = document.getElementById('priceInput');
                            if (typeof Number(input.value) === 'number' && !isNaN(Number(input.value))) {
                                var price = Number(input.value);
                                var quantity = Number(document.getElementById('quantityInput').value);
                                var value = price * quantity;
                                var valueText = document.getElementById('valueText');
                                valueText.innerHTML = Number(value).toFixed(2);
                            } else {
                                var msg = 'Price isnt number';
                                var priceInput = document.getElementById('valueText').innerHTML = msg;
                            }
                        });
                    });
                    return [
                        2
                    ];
            }
        });
    })();
}
function getHTMLInputById(id) {
    return document.getElementById(id);
}
function addItem() {
    return _async_to_generator(function() {
        var itemName, itemQuantity, itemMinQuantity, itemPrice, itemValue, itemBarcode, itemNotes, itemTags, request, response, errorData;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    itemName = getHTMLInputById('nameInput').value;
                    itemQuantity = getHTMLInputById('quantityInput').value;
                    itemMinQuantity = getHTMLInputById('minQuantityInput').value;
                    itemPrice = getHTMLInputById('priceInput').value;
                    itemValue = getHTMLInputById('valueInput').value;
                    itemBarcode = getHTMLInputById('barcodeInput').value;
                    itemNotes = getHTMLInputById('notesInput').value;
                    itemTags = getHTMLInputById('tagsInput').value;
                    request = new Request("/addItem", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            itemName: itemName,
                            itemQuantity: itemQuantity,
                            itemMinQuantity: itemMinQuantity,
                            itemPrice: itemPrice,
                            itemValue: itemValue,
                            itemBarcode: itemBarcode,
                            itemNotes: itemNotes,
                            itemTags: itemTags
                        })
                    });
                    return [
                        4,
                        fetch(request)
                    ];
                case 1:
                    response = _state.sent();
                    if (!!response.ok) return [
                        3,
                        3
                    ];
                    return [
                        4,
                        response.json()
                    ];
                case 2:
                    errorData = _state.sent();
                    throw new Error("HTTP Error: Status ".concat(response.status, ", Message: ").concat(errorData.message || 'Unknow err'));
                case 3:
                    $('#editItemModal').modal('hide');
                    return [
                        2
                    ];
            }
        });
    })();
}
function deleteItem(itemId) {
    return _async_to_generator(function() {
        var request, response, errorData;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    request = new Request("/deleteItem", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            itemId: itemId
                        })
                    });
                    return [
                        4,
                        fetch(request)
                    ];
                case 1:
                    response = _state.sent();
                    if (!!response.ok) return [
                        3,
                        3
                    ];
                    return [
                        4,
                        response.json()
                    ];
                case 2:
                    errorData = _state.sent();
                    throw new Error("HTTP Error: Status ".concat(response.status, ", Message: ").concat(errorData.message || 'Unknow err'));
                case 3:
                    $('#editItemModal').modal('hide');
                    loadItemTable();
                    return [
                        2
                    ];
            }
        });
    })();
}
function deleteAllItems() {
    return _async_to_generator(function() {
        var request, response;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    request = new Request("/deleteAllItems", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({})
                    });
                    return [
                        4,
                        fetch(request).then(function() {
                            loadItemTable();
                        })
                    ];
                case 1:
                    response = _state.sent();
                    return [
                        2
                    ];
            }
        });
    })();
}
function getItemById(itemId) {
    return _async_to_generator(function() {
        var request, response, data;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    request = new Request("/getItemById/".concat(itemId), {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    return [
                        4,
                        fetch(request)
                    ];
                case 1:
                    response = _state.sent();
                    return [
                        4,
                        response.json().then(function(data) {
                            return data;
                        })
                    ];
                case 2:
                    data = _state.sent();
                    return [
                        2,
                        data
                    ];
            }
        });
    })();
}
function updateItem(itemData) {
    return _async_to_generator(function() {
        var item, request, response, errorData;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    return [
                        4,
                        getItemById(itemData.itemId)
                    ];
                case 1:
                    item = _state.sent();
                    request = new Request("/edit/".concat(itemData.itemId), {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            itemName: itemData.name,
                            itemQuantity: itemData.quantity,
                            itemMinQuantity: itemData.minimumLevel,
                            itemPrice: itemData.price,
                            itemValue: itemData.value,
                            itemBarcode: item[0].barcode,
                            itemNotes: item[0].notes,
                            itemTags: item[0].tags
                        })
                    });
                    return [
                        4,
                        fetch(request)
                    ];
                case 2:
                    response = _state.sent();
                    if (!!response.ok) return [
                        3,
                        4
                    ];
                    return [
                        4,
                        response.json()
                    ];
                case 3:
                    errorData = _state.sent();
                    throw new Error("HTTP Error: Status ".concat(response.status, ", Message: ").concat(errorData.message || 'Unknow err'));
                case 4:
                    return [
                        2
                    ];
            }
        });
    })();
}
function editItemDialogUpdate(itemId) {
    return _async_to_generator(function() {
        var itemName, itemQuantity, itemMinQuantity, itemPrice, itemBarcode, itemNotes, itemTags, request, response, errorData, tableRow, itemValue;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    itemName = getHTMLInputById('nameInput').value;
                    itemQuantity = Number(getHTMLInputById('quantityInput').value);
                    itemMinQuantity = Number(getHTMLInputById('minimumLevelInput').value);
                    itemPrice = Number(getHTMLInputById('priceInput').value);
                    itemBarcode = getHTMLInputById('barcodeInput').value;
                    itemNotes = getHTMLInputById('notesInput').value;
                    itemTags = getHTMLInputById('tagsInput').value;
                    request = new Request("/edit/".concat(itemId), {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            itemName: itemName,
                            itemQuantity: itemQuantity,
                            itemMinQuantity: itemMinQuantity,
                            itemPrice: itemPrice,
                            itemBarcode: itemBarcode,
                            itemNotes: itemNotes,
                            itemTags: itemTags
                        })
                    });
                    return [
                        4,
                        fetch(request)
                    ];
                case 1:
                    response = _state.sent();
                    if (!!response.ok) return [
                        3,
                        3
                    ];
                    return [
                        4,
                        response.json()
                    ];
                case 2:
                    errorData = _state.sent();
                    throw new Error("HTTP Error: Status ".concat(response.status, ", Message: ").concat(errorData.message || 'Unknow err'));
                case 3:
                    $('#editItemModal').modal('hide');
                    tableRow = document.getElementById("tableRow_".concat(itemId));
                    itemValue = Number(itemQuantity) * Number(itemPrice);
                    tableRow.innerHTML = createTableRowHTML(itemId, itemName, itemQuantity, itemMinQuantity, itemPrice, itemValue);
                    return [
                        2
                    ];
            }
        });
    })();
}
function editPopupDecreaseQuantity() {
    var qualityInput = getHTMLInputById('quantityInput');
    console.log(qualityInput, qualityInput.value);
    qualityInput.value = String(Number(qualityInput.value) - 1);
    if (Number(qualityInput.value) < 0) qualityInput.value = String(0);
}
function editInputFieldNum(inputId, numberAdjustment) {
    var inputField = getHTMLInputById(inputId);
    inputField.value = Number(inputField.value) + numberAdjustment;
    if (Number(inputField.value) < 0) inputField.value = String(0);
}
function editPopUpAdjustQuantity(numberAdjustment) {
    editInputFieldNum('quantityInput', numberAdjustment);
    var price = getHTMLInputById('priceInput').value;
    var quantity = getHTMLInputById('quantityInput').value;
    var value = Number(price) * Number(quantity);
    var priceInput = document.getElementById('valueText');
    priceInput.innerHTML = Number(value).toFixed(2);
}
function incrementQuantity(itemId) {
    return _async_to_generator(function() {
        var tableRow, quantity, price, newQuantity, value;
        return _ts_generator(this, function(_state) {
            event.stopPropagation();
            tableRow = document.getElementById("tableRow_".concat(itemId));
            quantity = Number(tableRow.getElementsByClassName('quantityRow')[0].innerHTML);
            price = Number(tableRow.getElementsByClassName('priceRow')[0].innerHTML);
            newQuantity = quantity + 1;
            value = Number(price * quantity);
            tableRow.getElementsByClassName("quantityRow")[0].innerHTML = String(newQuantity);
            tableRow.getElementsByClassName("valueRow")[0].innerHTML = "$" + value.toFixed(2);
            sendQuantityChangeToTimer(itemId, newQuantity);
            return [
                2
            ];
        });
    })();
}
function decrementQuantity(itemId) {
    return _async_to_generator(function() {
        var tableRow, quantity, price, newQuantity, value;
        return _ts_generator(this, function(_state) {
            event.stopPropagation();
            tableRow = document.getElementById("tableRow_".concat(itemId));
            quantity = Number(tableRow.getElementsByClassName('quantityRow')[0].innerHTML);
            price = Number(tableRow.getElementsByClassName('priceRow')[0].innerHTML);
            newQuantity = quantity - 1;
            if (newQuantity < 0) {
                newQuantity = 0;
            }
            value = Number(price * quantity);
            tableRow.getElementsByClassName("quantityRow")[0].innerHTML = String(newQuantity);
            tableRow.getElementsByClassName("valueRow")[0].innerHTML = "$" + value.toFixed(2);
            sendQuantityChangeToTimer(itemId, newQuantity);
            return [
                2
            ];
        });
    })();
}
function sendQuantityChangeToTimer(itemId, newQuantity) {
    quantityChangeTimer.finalQuantity = newQuantity;
    quantityChangeTimer.itemId = itemId;
    // Reset timer if not done
    if (quantityChangeTimer.started) {
        clearTimeout(quantityChangeTimer.id);
    } else {
        quantityChangeTimer.started = true;
    }
    // Start timer
    quantityChangeTimer.id = setTimeout(function() {
        return _async_to_generator(function() {
            var item, request, response, errorData;
            return _ts_generator(this, function(_state) {
                switch(_state.label){
                    case 0:
                        quantityChangeTimer.started = false;
                        return [
                            4,
                            getItemById(quantityChangeTimer.itemId)
                        ];
                    case 1:
                        item = _state.sent();
                        request = new Request("/edit/".concat(quantityChangeTimer.itemId), {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                itemName: item[0]['name'],
                                itemQuantity: quantityChangeTimer.finalQuantity,
                                itemMinQuantity: item[0]['minimumLevel'],
                                itemPrice: item[0]['price'],
                                itemValue: item[0]['value'],
                                itemBarcode: item[0]['barcode'],
                                itemNotes: item[0]['notes'],
                                itemTags: item[0]['tags']
                            })
                        });
                        return [
                            4,
                            fetch(request)
                        ];
                    case 2:
                        response = _state.sent();
                        if (!!response.ok) return [
                            3,
                            4
                        ];
                        return [
                            4,
                            response.json()
                        ];
                    case 3:
                        errorData = _state.sent();
                        throw new Error("HTTP Error: Status ".concat(response.status, ", Message: ").concat(errorData.message || 'Unknow err'));
                    case 4:
                        return [
                            2
                        ];
                }
            });
        })();
    }, 500);
}
function showQualityAdjustmentButtons(itemId) {
    var tableRow = document.getElementById("tableRow_".concat(itemId));
    var buttons = tableRow.getElementsByTagName('button');
    for(var i = 0; i < buttons.length; i++){
        buttons[i].style.display = 'inline-block';
    }
}
function hideQualityAdjustmentButtons(itemId) {
    var tableRow = document.getElementById("tableRow_".concat(itemId));
    var buttons = tableRow.getElementsByTagName('button');
    for(var i = 0; i < buttons.length; i++){
        buttons[i].style.display = 'none';
    }
}
function onRowLoseFocus(itemId) {
    return _async_to_generator(function() {
        var item, tableRow, name, quantity, minimumLevel, price, value, request, response, errorData;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    if (isEditingRow == false) {
                        return [
                            2
                        ];
                    }
                    console.log('lose focus');
                    return [
                        4,
                        getItemById(itemId)
                    ];
                case 1:
                    item = _state.sent();
                    tableRow = document.getElementById("tableRow_".concat(itemId));
                    name = tableRow.getElementsByClassName("nameRow")[0].innerHTML;
                    quantity = item[0]['quantity'];
                    minimumLevel = tableRow.getElementsByClassName("minimumLevelRow")[0].innerHTML;
                    price = tableRow.getElementsByClassName("priceRow")[0].innerHTML;
                    value = tableRow.getElementsByClassName("valueRow")[0].innerHTML;
                    request = new Request("/edit/".concat(itemId), {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            itemName: name,
                            itemQuantity: quantity,
                            itemMinQuantity: minimumLevel,
                            itemPrice: price,
                            itemValue: value,
                            itemBarcode: item[0].barcode,
                            itemNotes: item[0].notes,
                            itemTags: item[0].tags
                        })
                    });
                    return [
                        4,
                        fetch(request)
                    ];
                case 2:
                    response = _state.sent();
                    if (!!response.ok) return [
                        3,
                        4
                    ];
                    return [
                        4,
                        response.json()
                    ];
                case 3:
                    errorData = _state.sent();
                    throw new Error("HTTP Error: Status ".concat(response.status, ", Message: ").concat(errorData.message || 'Unknow err'));
                case 4:
                    changeRowStateToDefaultView(itemId);
                    return [
                        2
                    ];
            }
        });
    })();
}
function startEditingQuantity(itemId) {
    return _async_to_generator(function() {
        return _ts_generator(this, function(_state) {
            event.stopPropagation();
            changeRowStateToEditQuantity(itemId);
            return [
                2
            ];
        });
    })();
}
function changeRowStateToDefaultView(itemId) {
    return _async_to_generator(function() {
        var item, name, quantity, minimumLevel, price, value, tableRow;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    isEditingRow = false;
                    return [
                        4,
                        getItemById(itemId)
                    ];
                case 1:
                    item = _state.sent();
                    name = item[0]['name'];
                    quantity = item[0]['quantity'];
                    minimumLevel = item[0]['minimumLevel'];
                    price = item[0]['price'];
                    value = item[0]['value'];
                    tableRow = document.getElementById("tableRow_".concat(itemId));
                    tableRow.innerHTML = createTableRowHTML(itemId, name, quantity, minimumLevel, price, value);
                    return [
                        2
                    ];
            }
        });
    })();
}
function changeRowStateToEditQuantity(itemId) {
    return _async_to_generator(function() {
        var item, tableRow, name, quantity, minimumLevel, price, value, quantityInput, initialValue, textInput, textLength;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    isEditingRow = true;
                    return [
                        4,
                        getItemById(itemId)
                    ];
                case 1:
                    item = _state.sent();
                    tableRow = document.getElementById("tableRow_".concat(itemId));
                    name = item[0]['name'];
                    quantity = item[0]['quantity'];
                    minimumLevel = item[0]['minimumLevel'];
                    price = item[0]['price'];
                    value = item[0]['value'];
                    tableRow.innerHTML = '\n        <td class="nameRow">'.concat(name, '</td>\n        <td style="text-align: left;">\n            <input type="text" class="quantityRow" id="tempInput" value="').concat(quantity, '" size="6" onblur="onRowLoseFocus(').concat(itemId, ')" style="margin-left: 30px; align-text: center;"></input>\n        </td>\n        <td class="minimumLevelRow">').concat(minimumLevel, '</td>\n        <td class="priceRow">').concat(price, '</td>\n        <td class="valueRow">').concat(value, "</td>\n    ");
                    quantityInput = getHTMLInputById('tempInput');
                    initialValue = quantityInput.value;
                    quantityInput.addEventListener('keydown', function(event1) {
                        if (event1.key == 'Enter') {
                            var input = getHTMLInputById('tempInput');
                            var result = calculateInputField(input.value);
                            isEditingRow = false;
                            if (result == null) input.value = initialValue;
                            else input.value = String(result);
                            var tableRow = document.getElementById("tableRow_".concat(itemId));
                            var item = new Item();
                            item.itemId = itemId;
                            item.name = tableRow.getElementsByClassName("nameRow")[0].innerHTML;
                            item.quantity = Number(result);
                            item.minimumLevel = Number(tableRow.getElementsByClassName("minimumLevelRow")[0].innerHTML);
                            item.price = Number(tableRow.getElementsByClassName("priceRow")[0].innerHTML);
                            item.value = Number(tableRow.getElementsByClassName("valueRow")[0].innerHTML);
                            updateItem(item);
                            tableRow.innerHTML = createTableRowHTML(itemId, name, Number(result), Number(minimumLevel), Number(price), Number(value));
                            event1.preventDefault();
                        }
                        if (event1.key == "Escape") {
                            changeRowStateToDefaultView(itemId);
                            event1.preventDefault();
                        }
                    });
                    textInput = getHTMLInputById("tempInput");
                    textInput.focus();
                    textLength = textInput.value.length;
                    textInput.setSelectionRange(textLength, textLength);
                    return [
                        2
                    ];
            }
        });
    })();
}
function searchForItem(name) {
    return _async_to_generator(function() {
        var request, response, data;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    if (name == "") {
                        name = "all";
                    }
                    request = new Request("/search/".concat(name), {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    return [
                        4,
                        fetch(request)
                    ];
                case 1:
                    response = _state.sent();
                    data = response.json().then(function(data) {
                        console.log(data);
                        var tableHTML = "\n            <thead>\n                <td>Name</td>\n                <td>Quantity</td>\n                <td>Minimum Level</td>\n                <td>Price</td>\n            </thead>\n        ";
                        for(var i = 0; i < data.length; i++){
                            tableHTML += createTableRowHTML(data[i]['id'], data[i]['name'], data[i]['quantity'], data[i]['minimumLevel'], data[i]['price'], data[i]['value']);
                        }
                        itemTable.innerHTML = tableHTML;
                    });
                    return [
                        2
                    ];
            }
        });
    })();
}
function loadItemTable() {
    return _async_to_generator(function() {
        var request, response, data;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    request = new Request("/search/all", {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    return [
                        4,
                        fetch(request)
                    ];
                case 1:
                    response = _state.sent();
                    data = response.json().then(function(data) {
                        var tableHTML = '\n            <thead>\n                <td style="opacity: 50%;">Name</td>\n                <td style="opacity: 50%; margin-left: 20px; padding: 20px">\n                <div style="background-color: none; width: 25px; height: 25px; display: inline-block;"></div>\n                Quantity\n                </td>\n                <td style="opacity: 50%;">Minimum Level</td>\n                <td style="opacity: 50%;">Price</td>\n                <td style="opacity: 50%;">Value</td>\n            </thead>\n        ';
                        for(var i = 0; i < data.length; i++){
                            tableHTML += createTableRowHTML(data[i]['id'], data[i]['name'], data[i]['quantity'], data[i]['minimumLevel'], data[i]['price'], data[i]['value']);
                        }
                        itemTable.innerHTML = tableHTML;
                    });
                    return [
                        2
                    ];
            }
        });
    })();
}
function loadLowStockItemTable() {
    return _async_to_generator(function() {
        var request, response, data;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    request = new Request("/lowStockItems", {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    return [
                        4,
                        fetch(request)
                    ];
                case 1:
                    response = _state.sent();
                    data = response.json().then(function(data) {
                        console.log(data);
                        var tableHTML = '\n            <thead>\n                <td style="opacity: 50%; width: 25%;">Name</td>\n                \n                <td style="opacity: 50%; width: 25%;">\n                <div style="background-color: none; width: 25px; height: 25px; display: inline-block;"></div>\n                Quantity\n                </td>\n\n                <td style="opacity: 50%; width: 15%;">Minimum Level</td>\n                <td style="opacity: 50%;">Price</td>\n                <td style="opacity: 50%;">Value</td>\n            </thead>\n        ';
                        for(var i = 0; i < data.length; i++){
                            tableHTML += createTableRowHTML(data[i]['id'], data[i]['name'], data[i]['quantity'], data[i]['minimumLevel'], data[i]['price'], data[i]['value']);
                        }
                        itemTable.innerHTML = tableHTML;
                    });
                    return [
                        2
                    ];
            }
        });
    })();
}
function createTableRowHTML(itemId, name, quantity, minimumLevel, price, value) {
    // If below stock level show red background div
    var lowStockStyle = 'display: inline; background-color: green';
    if (Number(quantity) < Number(minimumLevel)) {
        lowStockStyle = 'class="textBlockWithBGColor"';
    } else {
        lowStockStyle = 'style="display: inline-block"';
    }
    var html = '\n            <tr style="vertical-align: middle" id="tableRow_'.concat(itemId, '" onmouseover="showQualityAdjustmentButtons(').concat(itemId, ')" onmouseleave="hideQualityAdjustmentButtons(').concat(itemId, ')" onclick="openEditItemDialog(').concat(itemId, ')" >\n                <td class="nameRow">').concat(name, '</td>\n                <td style="">\n                    <div class="container" onclick="startEditingQuantity(').concat(itemId, ')" style="">\n\n                        <div style="background-color: transparent; display: inline-block; width: 30px; height: 30px;">\n                        <button style="display: none; width: 30px; height: 30px; padding: 0px;" class="btn btn-primary inventoryBtn" onclick="decrementQuantity(').concat(itemId, ')">-</button>\n                        </div>\n\n                        <div ').concat(lowStockStyle, '>\n                            <div class="quantityRow" style="display: inline; margin: 10px;" onclick="startEditingQuantity(').concat(itemId, ')">\n                            ').concat(quantity, '\n                            </div>\n                        </div>\n\n                        <div style="background-color: transparent; display: inline-block; width: 30px; height: 30px;">\n                        <button style="display: none; width: 30px; height: 30px; padding: 0px" class="btn btn-primary inventoryBtn" onclick="incrementQuantity(').concat(itemId, ')">+</button>\n                    </div>\n\n                    <div>\n                </td>\n                <td class="minimumLevelRow">').concat(minimumLevel, '</td>\n\n                <td>\n                $<p class="priceRow" style="display: inline-block">').concat(price, '</p>\n                </td>\n\n                <td class="valueRow">$').concat(value, "</td>\n            </tr>\n    ");
    return html;
}
function readFileAsText(file) {
    return _async_to_generator(function() {
        return _ts_generator(this, function(_state) {
            return [
                2,
                new Promise(function(resolve, reject) {
                    var reader = new FileReader();
                    reader.onload = function(event1) {
                        resolve(event1.target.result);
                    };
                    reader.onerror = function(event1) {
                        console.log("error");
                        reject(event1.target.result);
                    };
                    reader.readAsText(file);
                })
            ];
        });
    })();
}
function showUploadDialog() {
    return _async_to_generator(function() {
        return _ts_generator(this, function(_state) {
            $('#editItemModal').modal();
            popup.innerHTML = '\n        <div class="modal-dialog">\n\n        <!-- Modal content-->\n        <div class="modal-content">\n            <div class="modal-header">\n            <h4 class="modal-title">Edit Item</h4>\n            </div>\n            <div class="modal-body">\n\n                <div class="container">\n                <div class="row">\n                    <div class="col-md p-3" style="line-height: 1.8">\n                    <input type="file" id="csvFileInput" accept=".csv">\n                    </div>\n                </div>\n            </div>\n            <div class="d-flex justify-content-between">\n                <div class="">\n                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n                </div>\n                <div class="">\n                    <button type="button" class="btn btn-default" onclick="uploadCSV()">Upload</button>\n                </div>\n            </div>\n        </div>\n        \n        </div>\n    ';
            return [
                2
            ];
        });
    })();
}
function uploadCSV() {
    return _async_to_generator(function() {
        var csvFileInput, file, fileData, request, response, error;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    csvFileInput = document.getElementById('csvFileInput');
                    file = csvFileInput.files[0];
                    if (!file) {
                        return [
                            2
                        ];
                    }
                    _state.label = 1;
                case 1:
                    _state.trys.push([
                        1,
                        4,
                        ,
                        5
                    ]);
                    return [
                        4,
                        readFileAsText(file)
                    ];
                case 2:
                    fileData = _state.sent();
                    request = new Request("/uploadCSV", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            csvData: fileData
                        })
                    });
                    return [
                        4,
                        fetch(request)
                    ];
                case 3:
                    response = _state.sent();
                    return [
                        3,
                        5
                    ];
                case 4:
                    error = _state.sent();
                    console.log("error reading file: ", error);
                    return [
                        3,
                        5
                    ];
                case 5:
                    $('#editItemModal').modal('hide');
                    loadItemTable();
                    return [
                        2
                    ];
            }
        });
    })();
}
function loadTransactionLog() {
    return _async_to_generator(function() {
        var request, response, data;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    request = new Request("/getActivityLog", {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    return [
                        4,
                        fetch(request)
                    ];
                case 1:
                    response = _state.sent();
                    data = response.json().then(function(data) {
                        console.log(data);
                        var tableHTML = '\n            <thead>\n                <td style="opacity: 50%;">Name</td>\n                <td style="opacity: 50%;">Total Additions</td>\n                <td style="opacity: 50%;">Total Subtractions</td>\n            </thead>\n        ';
                        var oldValue = 0;
                        var newValue = 0;
                        var transaction = 0;
                        var quantityChangeSummaries = [];
                        for(var i = 0; i < data.length; i++){
                            oldValue = Number(data[i]['oldValue']);
                            newValue = Number(data[i]['newValue']);
                            transaction = oldValue - newValue;
                            var alreadyAdded = false;
                            for(var j = 0; j < quantityChangeSummaries.length; j++){
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
                                var t = new QuanityChangeSummary();
                                t.name = data[i]['itemName'];
                                if (transaction > 0) {
                                    t.totalAdditions += transaction;
                                }
                                if (transaction < 0) {
                                    t.totalSubtactions += Math.abs(transaction);
                                    console.log(t.name, t.totalSubtactions);
                                }
                                quantityChangeSummaries.push(t);
                            }
                        }
                        // Add merged quantity change summaries
                        for(var j1 = 0; j1 < quantityChangeSummaries.length; j1++){
                            var html = '\n                    <tr style="vertical-align: middle" id="tableRow_">\n\n                        <td class="typeRow">'.concat(quantityChangeSummaries[j1].name, '</td>\n\n                        <td style=""> ').concat(quantityChangeSummaries[j1].totalAdditions, '</td>\n\n                        <td style=""> ').concat(quantityChangeSummaries[j1].totalSubtactions, "</td>\n\n                    </tr>\n            ");
                            tableHTML += html;
                            itemTable.innerHTML = tableHTML;
                        }
                    });
                    return [
                        2
                    ];
            }
        });
    })();
}
function loadActivityLog() {
    return _async_to_generator(function() {
        var request, response, data;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    request = new Request("/getActivityLog", {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    return [
                        4,
                        fetch(request)
                    ];
                case 1:
                    response = _state.sent();
                    data = response.json().then(function(data) {
                        console.log(data);
                        var tableHTML = '\n            <thead>\n                <td style="opacity: 50%; width: 30%;">Name</td>\n                <td style="opacity: 50%; width: 15%;">Type</td>\n                <td style="opacity: 50%; width: 20%;">Activity</td>\n                <td style="opacity: 50%;">Time</td>\n                <td style="opacity: 50%;">Date</td>\n            </thead>\n        ';
                        for(var i = 0; i < data.length; i++){
                            var quantityChange = Number(data[i]['oldValue']) - Number(data[i]['newValue']);
                            var html = '\n                    <tr style="vertical-align: middle" id="tableRow_">\n                        <td class="typeRow">'.concat(data[i]['itemName'], '</td>\n                        <td class="typeRow">').concat(data[i]['type'], "</td>\n                        <td> Quanity change:   ").concat(quantityChange, " </td>\n                        <td> ").concat(data[i]['time'], " </td>\n                        <td> ").concat(data[i]['date'], " </td>\n                    </tr>\n            ");
                            tableHTML += html;
                        }
                        itemTable.innerHTML = tableHTML;
                    });
                    return [
                        2
                    ];
            }
        });
    })();
}

