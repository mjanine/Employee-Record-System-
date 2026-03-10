let activeRowId = null;
let currentType = "";
let currentDays = 0;

let sickCredits = { "row-1": 15, "row-2": 15 };

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const handleToggle = () => { if (sidebar) sidebar.classList.toggle('close'); };
    document.getElementById('closeBtn').addEventListener('click', handleToggle);
    document.getElementById('logoToggle').addEventListener('click', handleToggle);

    const tabRequests = document.getElementById('tab-requests');
    const tabHistory = document.getElementById('tab-history');
    const requestsContent = document.getElementById('requests-content');
    const historyContent = document.getElementById('history-content');

    tabRequests.addEventListener('click', () => {
        tabRequests.classList.add('active'); tabHistory.classList.remove('active');
        requestsContent.style.display = 'block'; historyContent.style.display = 'none';
    });

    tabHistory.addEventListener('click', () => {
        tabHistory.classList.add('active'); tabRequests.classList.remove('active');
        requestsContent.style.display = 'none'; historyContent.style.display = 'block';
    });

    // --- SEARCH BAR LOGIC ---
    // Selects the input field inside your search-wrapper
    const searchInput = document.querySelector('.search-wrapper input');
    
    searchInput.addEventListener('keyup', () => {
        const filter = searchInput.value.toLowerCase();
        // Selects all rows with the class 'table-row' in both tables
        const allRows = document.querySelectorAll('.table-row');

        allRows.forEach(row => {
            // Converts all text inside the row to lowercase for easier matching
            const rowText = row.innerText.toLowerCase();
            
            // Shows the row if it matches the search query, hides it if not
            if (rowText.includes(filter)) {
                row.style.display = ""; 
            } else {
                row.style.display = "none";
            }
        });
    });
});

function openViewModal(rowId, type, days) { 
    activeRowId = rowId; currentType = type; currentDays = days;
    const row = document.getElementById(rowId);
    const statusText = row.querySelector('.status-pill').textContent.trim();

    document.getElementById('modalActions').style.display = 'flex';
    document.getElementById('decisionBanner').style.display = 'none';
    document.getElementById('modalFileName').innerText = type.replace(" ", "_") + "_.pdf";

    // 1. Leave Balance Visibility (Sick Leave Only)
    document.getElementById('balanceContainer').style.display = (type === "Sick Leave") ? 'block' : 'none';
    if(type === "Sick Leave") document.getElementById('creditVal').innerText = sickCredits[rowId];

    // 2. Pending Status logic
    const label = document.getElementById('modalStatusLabel');
    if (statusText === "Pending") {
        label.className = "status-pill pending";
        label.innerHTML = `<i class="fas fa-exclamation-circle"></i> Pending`;
        document.getElementById('reviewerDetails').innerHTML = `<small>Reviewed by: ---</small>`;
    } else {
        showFinalStateInModal(statusText.includes("Approved") ? "Approved" : "Rejected");
    }

    document.getElementById('viewModal').style.display = 'flex'; 
}

function processRequest(status) {
    const row = document.getElementById(activeRowId);
    if (row) {
        if (status === 'Approved' && currentType === "Sick Leave") sickCredits[activeRowId] -= currentDays;
        showFinalStateInModal(status);
        row.querySelector('.status-cell').innerHTML = `<span class="status-pill ${status.toLowerCase()}"><i class="fas fa-${status === 'Approved' ? 'check' : 'times'}-circle"></i> ${status}</span>`;
        row.querySelector('.reviewer-cell').innerHTML = `<strong>HR Manager</strong><br><small>${new Date().toLocaleDateString()}</small>`;
        row.querySelector('td:last-child').innerHTML = `<button class="view-btn" onclick="openViewModal('${activeRowId}', '${currentType}', ${currentDays})">View</button>`;
        document.getElementById('history-table-body').appendChild(row);
    }
}

function showFinalStateInModal(status) {
    const label = document.getElementById('modalStatusLabel');
    label.className = `status-pill ${status.toLowerCase()}`;
    label.innerHTML = `<i class="fas fa-${status === 'Approved' ? 'check' : 'times'}-circle"></i> ${status}`;
    if (currentType === "Sick Leave") document.getElementById('creditVal').innerText = sickCredits[activeRowId];
    const pill = document.getElementById('decisionPill');
    pill.className = `banner-pill ${status.toLowerCase()}-banner`;
    pill.innerText = status;
    document.getElementById('modalActions').style.display = 'none';
    document.getElementById('decisionBanner').style.display = 'block';
    document.getElementById('reviewerDetails').innerHTML = `<small>Reviewed by: HR Manager</small>`;
}

function closeViewModal() { document.getElementById('viewModal').style.display = 'none'; }


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


