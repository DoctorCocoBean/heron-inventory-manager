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
            console.log("Date picker clicked");
            
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
            const startDate = start.format('MM/DD/YYYY');
            const endDate = end.format('MM/DD/YYYY');
            const picker = pickers.find(p => p.id === id);
            picker.self.querySelector(".datePickerBtn").innerHTML = `Date Range: <span class="greyText">${startDate} - ${endDate}</span>`;

            if (datePickerCallback) {
                datePickerCallback(startDate, endDate);
            }

            datePickerIsOpen = false;
        });

        pickers.push(new DatePicker(id, elements[i] as HTMLElement));
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
        console.log("Clicked outside the date picker, closing dropdown" );
        
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
    console.log(`Showing custom date picker for ${datePickerId}`);
    $(`#${datePickerId}`).children(".datePicker-dropdown").addClass("show");
    datePickerIsOpen = true;
}

function setDateToday(datePickerId) 
{
    const today = moment().format('MM/DD/YYYY');
    const picker = pickers.find(p => p.id === datePickerId);
    if (picker) {
        picker.self.querySelector(".datePickerBtn").innerHTML = `Date Range: <span class="greyText">${today} - ${today}</span>`;
    }

    const dropdown = picker.self.querySelector(".datePicker-dropdown") as HTMLElement;
    if (dropdown.classList.contains("show")) {
        console.log("Hiding dropdown menu for today selection");
        dropdown.classList.remove("show");
    }

    datePickerCallback(today, today);
    event.stopPropagation(); // Prevent the click event from propagating to the window
}

function setDateYesterday(datePickerId) 
{
    const yesterday = moment().subtract(1, 'days').format('MM/DD/YYYY');
    const picker = pickers.find(p => p.id === datePickerId);
    if (picker) {
        picker.self.querySelector(".datePickerBtn").innerHTML = `Date Range: <span class="greyText">${yesterday} - ${yesterday}</span>`;
    }

    const dropdown = picker.self.querySelector(".datePicker-dropdown") as HTMLElement;
    if (dropdown.classList.contains("show")) {
        console.log("Hiding dropdown menu for today selection");
        dropdown.classList.remove("show");
    }

    datePickerCallback(yesterday, yesterday);
    event.stopPropagation(); // Prevent the click event from propagating to the window
}

function setDateThisMonth(datePickerId) 
{
    const startOfMonth = moment().startOf('month').format('MM/DD/YYYY');
    const endOfMonth = moment().endOf('month').format('MM/DD/YYYY');
    const picker = pickers.find(p => p.id === datePickerId);
    if (picker) {
        picker.self.querySelector(".datePickerBtn").innerHTML = `Date Range: <span class="greyText">${startOfMonth} - ${endOfMonth}</span>`;
    }

    const dropdown = picker.self.querySelector(".datePicker-dropdown") as HTMLElement;
    if (dropdown.classList.contains("show")) {
        console.log("Hiding dropdown menu for today selection");
        dropdown.classList.remove("show");
    }

    datePickerCallback(startOfMonth, endOfMonth);
    event.stopPropagation(); // Prevent the click event from propagating to the window
}       

function setDateLastMonth(datePickerId) 
{
    const startOfLastMonth = moment().subtract(1, 'month').startOf('month').format('MM/DD/YYYY');
    const endOfLastMonth = moment().subtract(1, 'month').endOf('month').format('MM/DD/YYYY');
    const picker = pickers.find(p => p.id === datePickerId);
    if (picker) {
        picker.self.querySelector(".datePickerBtn").innerHTML = `Date Range: <span class="greyText">${startOfLastMonth} - ${endOfLastMonth}</span>`;
    }

    const dropdown = picker.self.querySelector(".datePicker-dropdown") as HTMLElement;
    if (dropdown.classList.contains("show")) {
        console.log("Hiding dropdown menu for today selection");
        dropdown.classList.remove("show");
    }

    datePickerCallback(startOfLastMonth, endOfLastMonth);
    event.stopPropagation(); // Prevent the click event from propagating to the window
}

function setDateLast3Months(datePickerId) 
{
    const startOfLast3Months = moment().subtract(3, 'months').startOf('month').format('MM/DD/YYYY');
    const endOfLast3Months = moment().endOf('month').format('MM/DD/YYYY');
    const picker = pickers.find(p => p.id === datePickerId);
    if (picker) {
        picker.self.querySelector(".datePickerBtn").innerHTML = `Date Range: <span class="greyText">${startOfLast3Months} - ${endOfLast3Months}</span>`;
    }

    const dropdown = picker.self.querySelector(".datePicker-dropdown") as HTMLElement;
    if (dropdown.classList.contains("show")) {
        console.log("Hiding dropdown menu for today selection");
        dropdown.classList.remove("show");
    }

    datePickerCallback(startOfLast3Months, endOfLast3Months);
    event.stopPropagation(); // Prevent the click event from propagating to the window
}

function setDateThisYear(datePickerId) 
{
    const startOfYear = moment().startOf('year').format('MM/DD/YYYY');
    const endOfYear = moment().endOf('year').format('MM/DD/YYYY');
    const picker = pickers.find(p => p.id === datePickerId);
    if (picker) {
        picker.self.querySelector(".datePickerBtn").innerHTML = `Date Range: <span class="greyText">${startOfYear} - ${endOfYear}</span>`;
    }

    const dropdown = picker.self.querySelector(".datePicker-dropdown") as HTMLElement;
    if (dropdown.classList.contains("show")) {
        console.log("Hiding dropdown menu for today selection");
        dropdown.classList.remove("show");
    }

    datePickerCallback(startOfYear, endOfYear);
    event.stopPropagation(); // Prevent the click event from propagating to the window
}