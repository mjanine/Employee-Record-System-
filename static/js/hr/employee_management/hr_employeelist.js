document.addEventListener('DOMContentLoaded', function() {
    // === SIDEBAR TOGGLE LOGIC (From Reference) ===
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const logoToggle = document.getElementById('logoToggle');

    const handleToggle = () => { 
        if (sidebar) sidebar.classList.toggle('close'); 
    };

    if (closeBtn) closeBtn.addEventListener('click', handleToggle);
    if (logoToggle) logoToggle.addEventListener('click', handleToggle);


    // === EMPLOYEE TABLE LOGIC ===
    const tableBody = document.getElementById('employeeTableBody');
    const searchInput = document.getElementById('searchInput');
    const positionSelect = document.getElementById('filterPosition');
    const statusSelect = document.getElementById('filterStatus');

    // Default Data
    let storedEmployees = JSON.parse(localStorage.getItem('addedEmployees')) || [
        { id: "2024-001", fullName: "Dela Cruz, Juan", dept: "CCS", pos: "Instructor", status: "Active" },
        { id: "2024-002", fullName: "Santos, Maria", dept: "Registrar", pos: "Admin Staff", status: "On Leave" },
        { id: "2024-003", fullName: "Rizal, Jose", dept: "CCS", pos: "Dean", status: "Active" }
    ];

    /**
     * Renders the employee table rows
     */
    function renderTable(data) {
        tableBody.innerHTML = "";
        
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 40px; color: #999;">No records match your search.</td></tr>`;
            return;
        }

        data.forEach(emp => {
            const row = document.createElement('tr');
            // Format status class for CSS (converts "On Leave" to "on_leave")
            const statusClass = emp.status ? emp.status.toLowerCase().replace(/\s+/g, '_') : "active";

            row.innerHTML = `
                <td><strong>${emp.id}</strong></td>
                <td>${emp.fullName}</td>
                <td>${emp.dept}</td>
                <td>${emp.pos}</td>
                <td><span class="status ${statusClass}">${emp.status}</span></td>
                <td>
                    <a href="../../accounts/hr_profile_view.html?id=${emp.id}" class="action-link">View</a> | 
                    <a href="../../accounts/hr_profile_edit.html?id=${emp.id}" class="action-link">Edit</a>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    /**
     * Filters logic for Search and Dropdowns
     */
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const posValue = positionSelect.value.toLowerCase();
        const statusValue = statusSelect.value.toLowerCase();

        const filtered = storedEmployees.filter(emp => {
            const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm) || 
                                 emp.id.toLowerCase().includes(searchTerm);
            const matchesPos = posValue === "" || emp.pos.toLowerCase() === posValue;
            const matchesStatus = statusValue === "" || emp.status.toLowerCase() === statusValue;
            
            return matchesSearch && matchesPos && matchesStatus;
        });

        renderTable(filtered);
    }

    // Initial load
    renderTable(storedEmployees);

    // Filter Events
    searchInput.addEventListener('input', applyFilters);
    positionSelect.addEventListener('change', applyFilters);
    statusSelect.addEventListener('change', applyFilters);
});


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


