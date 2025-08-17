class DatePicker 
{
    id: string;
    isOpen: boolean;
    self: HTMLElement;

    constructor(id: string, element: HTMLElement) {
        this.id = id;
        this.isOpen = false;
        this.self = element
    }
}

var datePickerIsOpen             = false;
var datePickerCallback: Function = null;
var pickers: DatePicker[]        = [];

window.onload = function() 
{
    const elements = document.getElementsByClassName("datepicker");

    // Create a DatePicker instance for each element with the class "datepicker
    for (let i = 0; i < elements.length; i++) 
    {
        const id = Math.random().toString(36).substring(2, 15);
        elements[i].innerHTML = `
            <button class="datePickerBtn" onclick="">
                Date Range:
                <span class="greyText">00/00/2025 - 00/00/2025</span>
            </button>
        `;

        elements[i].innerHTML += `
            <div class="datePicker-dropdown">
                <a href="#" onclick="setDateToday('${id}')">Today</a>
                <a href="#" onclick="setDateYesterday('${id}')">Yesterday</a>
                <a href="#" onclick="setDateThisMonth('${id}')">This Month</a>
                <a href="#" onclick="setDateLastMonth('${id}')">Last Month</a>
                <a href="#" onclick="setDateLast3Months('${id}')">Last 3 Months</a>
                <a href="#" onclick="setDateThisYear('${id}')">This Year</a>
                <a href="#" id="customDateBtn_${id}" onclick="showCustomDatePicker('${id}')">Custom</a>
            </div> 
        `;

        // On click, toggle the dropdown menu position
        const dropdownMenu = elements[i].querySelector(".datePicker-dropdown") as HTMLElement;
        elements[i].addEventListener("click", function() 
        {
            const rect = elements[i].getBoundingClientRect();
            const margin = 10; 

            dropdownMenu.style.top = `${rect.bottom + window.scrollY + margin}px`;
            dropdownMenu.style.left = `${rect.left}px`;
            dropdownMenu.classList.add("show");
        }); 

        // Initialize the date range picker
        $(`#customDateBtn_${id}`).daterangepicker({
            alwaysShowCalendars: true,
        }, function(start, end, label) 
        {
            const startDate = start.toDate();
            const endDate = end.toDate();
            const picker = pickers.find(p => p.id === id);
            picker.self.querySelector(".datePickerBtn").innerHTML = `Date Range: <span class="greyText">${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</span>`;

            if (datePickerCallback) {
                datePickerCallback(startDate, endDate);
            }

            datePickerIsOpen = false;
        });

        pickers.push(new DatePicker(id, elements[i] as HTMLElement));
    }

    for (let i = 0; i < pickers.length; i++)
    {
        const picker = pickers[i];
        setDateThisMonth(picker.id); // Set default date range to this month
    }
}

// Close dropdown if clicked outside
window.addEventListener("click", (event) => 
{
    const targetElement = event.target as HTMLElement;
    if (
        !targetElement.matches(".datePickerBtn") &&
        !targetElement.closest(".datePicker-dropdown") &&
        !datePickerIsOpen) 
    {
        for (let i = 0; i < pickers.length; i++)
        {
            const picker = pickers[i];  
            const dropdown = picker.self.querySelector(".datePicker-dropdown") as HTMLElement;
            if (dropdown.classList.contains("show")) {
                dropdown.classList.remove("show");
            }
        }
    }
});

function showCustomDatePicker(datePickerId) 
{
    $(`#${datePickerId}`).children(".datePicker-dropdown").addClass("show");
    datePickerIsOpen = true;
}

function setDateToday(datePickerId) 
{
    const todayStart: Date = new Date();
    todayStart.setHours(0, 0, 0, 0); // Reset time to midnight
    const todayEnd: Date = new Date();
    todayEnd.setHours(24, 60, 60, 60); // Reset time to midnight

    const picker = pickers.find(p => p.id === datePickerId);
    if (picker) {
        picker.self.querySelector(".datePickerBtn").innerHTML = `Date Range: <span class="greyText">${todayStart.toLocaleDateString()} - ${todayEnd.toLocaleDateString()}</span>`;
    }

    const dropdown = picker.self.querySelector(".datePicker-dropdown") as HTMLElement;
    if (dropdown.classList.contains("show")) {
        dropdown.classList.remove("show");
    }

    datePickerCallback(todayStart, todayEnd);
    event.stopPropagation(); // Prevent the click event from propagating to the window
}

function setDateYesterday(datePickerId) 
{
    const yesterdayStart: Date = new Date();
    yesterdayStart.setHours(0, 0, 0, 0); // Reset time to midnight
    yesterdayStart.setDate(yesterdayStart.getDate() - 1); // Set to yesterday

    const yesterdayEnd: Date = new Date();
    yesterdayEnd.setHours(24, 60, 60, 60); // Reset time to midnight
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1); // Set to yesterday

    const picker = pickers.find(p => p.id === datePickerId);
    if (picker) {
        picker.self.querySelector(".datePickerBtn").innerHTML = `Date Range: <span class="greyText">${yesterdayStart.toLocaleDateString()} - ${yesterdayEnd.toLocaleDateString()}</span>`;
    }

    const dropdown = picker.self.querySelector(".datePicker-dropdown") as HTMLElement;
    if (dropdown.classList.contains("show")) {
        dropdown.classList.remove("show");
    }

    datePickerCallback(yesterdayStart, yesterdayEnd);
    event.stopPropagation(); // Prevent the click event from propagating to the window
}

function setDateThisMonth(datePickerId) 
{
    const startOfMonth = new Date();
    startOfMonth.setDate(1); // Set to the first day of the month

    const endOfMonth = new Date()
    endOfMonth.setMonth(endOfMonth.getMonth() + 1); // Move to the next month
    endOfMonth.setDate(0); // Set to the last day of the current month

    const picker = pickers.find(p => p.id === datePickerId);
    if (picker) {
        picker.self.querySelector(".datePickerBtn").innerHTML = `Date Range: <span class="greyText">${startOfMonth.toLocaleDateString()} - ${endOfMonth.toLocaleDateString()}</span>`;
    }

    const dropdown = picker.self.querySelector(".datePicker-dropdown") as HTMLElement;
    if (dropdown.classList.contains("show")) {
        dropdown.classList.remove("show");
    }

    datePickerCallback(startOfMonth, endOfMonth);
    event.stopPropagation(); // Prevent the click event from propagating to the window
}       

function setDateLastMonth(datePickerId) 
{
    const startOfLastMonth = new Date();
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1); // Move to the last month
    startOfLastMonth.setDate(1); // Set to the first day of the month

    const endOfLastMonth = new Date()
    endOfLastMonth.setMonth(endOfLastMonth.getMonth()); // Move to the next month
    endOfLastMonth.setDate(1);

    const picker = pickers.find(p => p.id === datePickerId);
    if (picker) {
        picker.self.querySelector(".datePickerBtn").innerHTML = `Date Range: <span class="greyText">${startOfLastMonth.toLocaleDateString()} - ${endOfLastMonth.toLocaleDateString()}</span>`;
    }

    const dropdown = picker.self.querySelector(".datePicker-dropdown") as HTMLElement;
    if (dropdown.classList.contains("show")) {
        dropdown.classList.remove("show");
    }

    datePickerCallback(startOfLastMonth, endOfLastMonth);
    event.stopPropagation(); // Prevent the click event from propagating to the window
}

function setDateLast3Months(datePickerId) 
{
    const endOfThisMonth = new Date()
    const startOfLast3Months = new Date();
    startOfLast3Months.setMonth(startOfLast3Months.getMonth() - 3); // Move to the last month
    startOfLast3Months.setDate(1); // Set to the first day of the month

    const picker = pickers.find(p => p.id === datePickerId);
    if (picker) {
        picker.self.querySelector(".datePickerBtn").innerHTML = `Date Range: <span class="greyText">${startOfLast3Months.toLocaleDateString()} - ${endOfThisMonth.toLocaleDateString()}</span>`;
    }

    const dropdown = picker.self.querySelector(".datePicker-dropdown") as HTMLElement;
    if (dropdown.classList.contains("show")) {
        dropdown.classList.remove("show");
    }

    datePickerCallback(startOfLast3Months, endOfThisMonth);
    event.stopPropagation(); // Prevent the click event from propagating to the window
}

function setDateThisYear(datePickerId) 
{
    const startOfYear = new Date();
    startOfYear.setMonth(0); // Set to January
    startOfYear.setDate(1);

    const endOfYear = new Date();
    endOfYear.setMonth(11); // Set to December
    endOfYear.setDate(31); // Set to the last day of the year

    const picker = pickers.find(p => p.id === datePickerId);
    if (picker) {
        picker.self.querySelector(".datePickerBtn").innerHTML = `Date Range: <span class="greyText">${startOfYear.toLocaleDateString()} - ${endOfYear.toLocaleDateString()}</span>`;
    }

    const dropdown = picker.self.querySelector(".datePicker-dropdown") as HTMLElement;
    if (dropdown.classList.contains("show")) {
        dropdown.classList.remove("show");
    }

    datePickerCallback(startOfYear, endOfYear);
    event.stopPropagation(); // Prevent the click event from propagating to the window
}