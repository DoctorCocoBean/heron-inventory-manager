class DatePicker {
    constructor(element) {
        this.id = Math.random().toString(36).substring(2, 15);
        this.isOpen = false;
        this.self = element;
    }
}
const datePicker = document.getElementById("datePickerBtn");
const dropdownMenu = document.getElementById("dropdownMenu");
var datePickerIsOpen = false;
var pickers = [];
window.onload = function () {
    const elements = document.getElementsByClassName("datePicker");
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        pickers.push(new DatePicker(element));
    }
    console.log("Date pickers initialized:", pickers);
};
datePicker.addEventListener("click", function () {
    console.log("Date picker clicked");
    const rect = datePicker.getBoundingClientRect();
    const margin = 10;
    dropdownMenu.style.top = `${rect.bottom + window.scrollY + margin}px`;
    dropdownMenu.style.left = `${rect.left}px`;
    dropdownMenu.classList.toggle("show");
});
// Close dropdown if clicked outside
window.addEventListener("click", (event) => {
    const targetElement = event.target;
    if (!targetElement.matches(".datePickerBtn") && !datePickerIsOpen) {
        console.log("Clicked outside the date picker, closing dropdown");
        dropdownMenu.classList.remove("show");
    }
});
$('#customDateBtn').daterangepicker({}, function (start, end, label) {
    const startDate = start.format('MM/DD/YYYY');
    const endDate = end.format('MM/DD/YYYY');
    document.getElementById("datePicker").innerHTML = `Date Range: <span class="greyText">${startDate} - ${endDate}</span>`;
    console.log(`Selected date range: ${startDate} - ${endDate}`);
    datePickerIsOpen = false;
});
$('#customDateBtn').on('hide.daterangepicker', function (event) {
    event.stopPropagation(); // Prevent the click from propagating to the document
    datePickerIsOpen = false; // Set the flag to true when the custom date button is clicked
});
function showCustomDatePicker(datePickerId) {
    $(`#${datePickerId}`).show();
    datePickerIsOpen = true;
}
function setDateToday(datePickerId) {
    const today = moment().format('MM/DD/YYYY');
    document.getElementById(datePickerId).innerHTML = `Date Range: <span class="greyText">${today} - ${today}</span>`;
    dropdownMenu.classList.remove("show");
    datePickerIsOpen = false;
}
function setDateYesterday(datePickerId) {
    const yesterday = moment().subtract(1, 'days').format('MM/DD/YYYY');
    document.getElementById(datePickerId).innerHTML = `Date Range: <span class="greyText">${yesterday} - ${yesterday}</span>`;
    dropdownMenu.classList.remove("show");
    datePickerIsOpen = false;
}
function setDateThisMonth(datePickerId) {
    const startOfMonth = moment().startOf('month').format('MM/DD/YYYY');
    const endOfMonth = moment().endOf('month').format('MM/DD/YYYY');
    document.getElementById(datePickerId).innerHTML = `Date Range: <span class="greyText">${startOfMonth} - ${endOfMonth}</span>`;
    dropdownMenu.classList.remove("show");
    datePickerIsOpen = false;
}
function setDateLastMonth(datePickerId) {
    const startOfLastMonth = moment().subtract(1, 'month').startOf('month').format('MM/DD/YYYY');
    const endOfLastMonth = moment().subtract(1, 'month').endOf('month').format('MM/DD/YYYY');
    document.getElementById(datePickerId).innerHTML = `Date Range: <span class="greyText">${startOfLastMonth} - ${endOfLastMonth}</span>`;
    dropdownMenu.classList.remove("show");
    datePickerIsOpen = false;
}
function setDateLast3Months(datePickerId) {
    const startOfLast3Months = moment().subtract(3, 'months').startOf('month').format('MM/DD/YYYY');
    const endOfLast3Months = moment().endOf('month').format('MM/DD/YYYY');
    document.getElementById(datePickerId).innerHTML = `Date Range: <span class="greyText">${startOfLast3Months} - ${endOfLast3Months}</span>`;
    dropdownMenu.classList.remove("show");
    datePickerIsOpen = false;
}
function setDateThisYear(datePickerId) {
    const startOfYear = moment().startOf('year').format('MM/DD/YYYY');
    const endOfYear = moment().endOf('year').format('MM/DD/YYYY');
    document.getElementById(datePickerId).innerHTML = `Date Range: <span class="greyText">${startOfYear} - ${endOfYear}</span>`;
    dropdownMenu.classList.remove("show");
    datePickerIsOpen = false;
}
//# sourceMappingURL=datePicker.js.map