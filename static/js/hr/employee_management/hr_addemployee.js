document.addEventListener('DOMContentLoaded', () => {
    // === Sidebar Toggle Logic (Partner's JS Hook) ===
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const logoToggle = document.getElementById('logoToggle');

    const handleToggle = () => { 
        if (sidebar) sidebar.classList.toggle('close'); 
    };

    if (closeBtn) closeBtn.addEventListener('click', handleToggle);
    if (logoToggle) logoToggle.addEventListener('click', handleToggle);
});

/**
 * Saves new employee data to localStorage
 */
function saveEmployee() {
    // Get Field Values
    const fName = document.getElementById('firstName').value.trim();
    const lName = document.getElementById('lastName').value.trim();
    const id = document.getElementById('empID').value.trim();
    const status = document.getElementById('empStatus').value;
    const empType = document.getElementById('empType').value.trim();
    const dateHired = document.getElementById('dateHired').value;
    const department = document.getElementById('dept').value.trim();
    const position = document.getElementById('pos').value.trim();
    
    const email = document.getElementById('email').value.trim();
    const contact = document.getElementById('contact').value.trim();
    const address = document.getElementById('address').value.trim();

    // 1. Validate Required Fields
    if (!fName || !lName || !id || !department || !position) {
        alert("Please fill in all required fields (Names, ID, Department, and Position)");
        return;
    }

    // 2. Create Employee Object
    const newEmployee = {
        id: id,
        fullName: `${lName}, ${fName}`,
        dept: department,
        pos: position,
        status: status,
        empType: empType || "N/A",
        dateHired: dateHired || "N/A",
        email: email || "N/A",
        contact: contact || "N/A",
        address: address || "N/A"
    };

    // 3. Save to LocalStorage
    try {
        let employees = JSON.parse(localStorage.getItem('addedEmployees')) || [];
        
        // Prevent Duplicate IDs
        if (employees.some(emp => emp.id === id)) {
            alert("Error: An employee with this ID already exists.");
            return;
        }

        employees.push(newEmployee);
        localStorage.setItem('addedEmployees', JSON.stringify(employees));
        
        // 4. Success Feedback & Redirect
        alert("Employee successfully added to the records!");
        window.location.href = 'hr_employeelist.html';
        
    } catch (error) {
        console.error("Storage Error:", error);
        alert("An error occurred while saving. Please check browser storage permissions.");
    }
}


const sidebar = document.getElementById("sidebar");
const logoToggle = document.getElementById("logoToggle");
const closeBtn = document.getElementById("closeBtn");
const menuItems = document.querySelectorAll(".menu-item");
const dashboard = document.querySelector(".dashboard-wrapper");

// Close button (only when expanded)
closeBtn.addEventListener("click", () => {
    sidebar.classList.add("collapsed");
    adjustDashboard();
});

// Open via logo click
logoToggle.addEventListener("click", () => {
    if (sidebar.classList.contains("collapsed")) {
        sidebar.classList.remove("collapsed");
        adjustDashboard();
    }
});

// Tooltip text & active menu highlighting
menuItems.forEach(item => {
    const text = item.querySelector("span").innerText;
    item.setAttribute("data-text", text);

    item.addEventListener("click", () => {
        document.querySelector(".menu-item.active")?.classList.remove("active");
        item.classList.add("active");
    });
});

// Adjust dashboard margin based on sidebar state
function adjustDashboard() {
    if(!dashboard || !sidebar) return;
    if(sidebar.classList.contains("collapsed")){
        dashboard.style.marginLeft = "120px";
    } else {
        dashboard.style.marginLeft = "340px";
    }
}
// Initial adjustment
adjustDashboard();

const loggedUser = "Tatsu"; // Replace with dynamic login session later
const usernameElement = document.getElementById("username");
if(usernameElement){
    usernameElement.textContent = loggedUser.toUpperCase();
}

const quotes = [
    "Success is walking from failure to failure with no loss of enthusiasm.",
    "Hard work beats talent when talent doesn't work hard.",
    "Consistency creates success.",
    "Dream big and work hard.",
    "Stay focused and never quit.",
    "Small progress each day adds up to big results.",
    "Discipline is choosing between what you want now and what you want most."
];
const quoteElement = document.getElementById("quote");
function rotateQuote(){
    if(!quoteElement) return;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteElement.textContent = quotes[randomIndex];
}
rotateQuote();
setInterval(rotateQuote, 8000);

document.querySelectorAll(".quick-actions button").forEach(btn => {
    btn.addEventListener("click", () => {
        const link = btn.getAttribute("data-link");
        if(link && link !== "#"){
            window.location.href = link;
        }
    });
});

const helpBtn = document.getElementById("helpBtn");
const helpModal = document.getElementById("helpModal");
const closeHelp = document.getElementById("closeHelp");

if(helpBtn){
    helpBtn.addEventListener("click", () => {
        if(helpModal){
            helpModal.style.display = "flex";
        }
    });
}
if(closeHelp){
    closeHelp.addEventListener("click", () => {
        helpModal.style.display = "none";
    });
};


const employeeData = {
    total: 546,
    active: 902,
    leave: 67
};

const totalEmployees = document.getElementById("totalEmployees");
const activeEmployees = document.getElementById("activeEmployees");
const leaveEmployees = document.getElementById("leaveEmployees");

if(totalEmployees) totalEmployees.textContent = employeeData.total;
if(activeEmployees) activeEmployees.textContent = employeeData.active;
if(leaveEmployees) leaveEmployees.textContent = employeeData.leave;


function animateNumber(element, target){
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
        current += step;
        if(current >= target){
            current = target;
            clearInterval(timer);
        }
        element.textContent = current;
    }, 20);
}

if(totalEmployees) animateNumber(totalEmployees, employeeData.total);
if(activeEmployees) animateNumber(activeEmployees, employeeData.active);
if(leaveEmployees) animateNumber(leaveEmployees, employeeData.leave);

const canvas = document.getElementById("attendanceChart");
if(canvas){
    const ctx = canvas.getContext("2d");
    const attendanceData = [
        {label:"Present", value:50, color:"#5aa0ff"},
        {label:"Absent", value:30, color:"#7be495"},
        {label:"Late", value:20, color:"#ffb86c"}
    ];
    let startAngle = 0;
    attendanceData.forEach(item => {
        const slice = (item.value / 100) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(100,100);
        ctx.arc(100,100,100,startAngle,startAngle + slice);
        ctx.fillStyle = item.color;
        ctx.fill();
        startAngle += slice;
    });
}