// ── SIDEBAR ──
const sidebar = document.getElementById("sidebar");
const logoToggle = document.getElementById("logoToggle");
const closeBtn = document.getElementById("closeBtn");
const mainWrapper = document.getElementById("mainWrapper");

closeBtn.addEventListener("click", () => {
    sidebar.classList.add("collapsed");
});
logoToggle.addEventListener("click", () => {
    if (sidebar.classList.contains("collapsed")) sidebar.classList.remove("collapsed");
});

document.querySelectorAll(".menu-item").forEach(item => {
    const text = item.querySelector("span")?.innerText;
    if (text) item.setAttribute("data-text", text);
    item.addEventListener("click", () => {
        document.querySelector(".menu-item.active")?.classList.remove("active");
        item.classList.add("active");
    });
});

// ── SAMPLE DATA ──
const employees = [
    { id: "001", name: "Dela Cruz, Juan",   first: "Juan",   last: "Dela Cruz",  position: "Instructor", dept: "College of Computer Studies", type: "Full-Time", tag: "CCS" },
    { id: "002", name: "Santos, Maria",     first: "Maria",  last: "Santos",     position: "Instructor", dept: "College of Computer Studies", type: "Full-Time", tag: "CCS" },
    { id: "003", name: "Reyes, Carlos",     first: "Carlos", last: "Reyes",      position: "Instructor", dept: "College of Computer Studies", type: "Full-Time", tag: "CCS" },
    { id: "004", name: "Garcia, Ana",       first: "Ana",    last: "Garcia",     position: "Instructor", dept: "College of Computer Studies", type: "Part-Time", tag: "CCS" },
];

// Per-employee weekly records: [Sun..Sat] null = no data, else {hours, status}
const attendanceRecords = {
    "001": [null, {h:"8h 00m",s:"present"}, {h:"4h 36m",s:"late"}, {h:"",s:"leave"}, {h:"8h 39m",s:"present"}, {h:"",s:"active"}, null],
    "002": [null, {h:"6h 24m",s:"late"},    {h:"8h 00m",s:"present"}, {h:"8h 00m",s:"present"}, {h:"",s:"absent"}, {h:"",s:"active"}, null],
    "003": [null, {h:"8h 00m",s:"present"}, {h:"8h 12m",s:"present"}, {h:"3h 45m",s:"late"},    {h:"8h 00m",s:"present"}, {h:"",s:"leave"}, null],
    "004": [null, {h:"8h 15m",s:"present"}, {h:"8h 00m",s:"present"}, {h:"8h 23m",s:"present"}, {h:"7h 24m",s:"late"},    {h:"",s:"active"}, null],
};

const dayLabels = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

// ── BADGE HTML ──
function badgeHTML(rec) {
    if (!rec) return `<span style="opacity:0.3">—</span>`;
    const icons = { present:"check-circle", late:"clock", leave:"moon", absent:"times-circle", active:"circle" };
    const icon = icons[rec.s] || "circle";
    const label = rec.s === "present" ? (rec.h || "Present") : rec.s === "late" ? (rec.h || "Late") : rec.s.charAt(0).toUpperCase()+rec.s.slice(1);
    return `<span class="badge ${rec.s}"><i class="fas fa-${icon}"></i>${label}</span>`;
}

// ── RENDER MAIN TABLE ──
let currentWeek = 5;
function renderTable(data) {
    const tbody = document.getElementById("attendanceBody");
    tbody.innerHTML = "";
    data.forEach(emp => {
        const rec = attendanceRecords[emp.id] || [];
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <div class="emp-cell" data-id="${emp.id}">
                    <div class="emp-avatar"><i class="fas fa-user"></i></div>
                    <div>
                        <div class="emp-name">${emp.last}, ${emp.first}</div>
                        <div class="emp-sub">${emp.position}</div>
                        <span class="emp-tag">${emp.tag}</span>
                    </div>
                </div>
            </td>
            ${rec.map(r => `<td>${badgeHTML(r)}</td>`).join("")}
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll(".emp-cell").forEach(cell => {
        cell.addEventListener("click", () => {
            const emp = employees.find(e => e.id === cell.dataset.id);
            if (emp) openDetail(emp);
        });
    });
}

document.getElementById("weekLabel").textContent = `Week ${currentWeek}`;
document.getElementById("prevWeek").addEventListener("click", () => {
    if (currentWeek > 1) currentWeek--;
    document.getElementById("weekLabel").textContent = `Week ${currentWeek}`;
});
document.getElementById("nextWeek").addEventListener("click", () => {
    currentWeek++;
    document.getElementById("weekLabel").textContent = `Week ${currentWeek}`;
});

// Search
document.getElementById("searchInput").addEventListener("input", function() {
    const q = this.value.toLowerCase();
    const filtered = employees.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.id.includes(q) ||
        e.dept.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q)
    );
    renderTable(filtered);
});

renderTable(employees);

// ── WEEKLY DETAIL DATA (per employee) ──
const weeklyData = {
    "001": {
        "Feb 4 - 10": [
            { date:"February 4, 2026", day:"Monday", in:"8:03 AM", out:"5:02 PM", total:"8h 59m", status:"present" },
            { date:"February 5, 2026", day:"Tuesday", in:"8:10 AM", out:"5:00 PM", total:"8h 50m", status:"present" },
            { date:"February 6, 2026", day:"Wednesday", in:"—", out:"—", total:"—", status:"leave" },
            { date:"February 7, 2026", day:"Thursday", in:"8:00 AM", out:"4:39 PM", total:"8h 39m", status:"present" },
        ],
        "Feb 11 - 17": [
            { date:"February 11, 2026", day:"Monday", in:"8:20 AM", out:"5:05 PM", total:"8h 45m", status:"late" },
        ]
    },
    "002": {
        "Feb 4 - 10": [
            { date:"February 4, 2026", day:"Monday", in:"9:30 AM", out:"3:54 PM", total:"6h 24m", status:"late" },
            { date:"February 5, 2026", day:"Tuesday", in:"8:00 AM", out:"4:00 PM", total:"8h 00m", status:"present" },
            { date:"February 6, 2026", day:"Wednesday", in:"8:00 AM", out:"4:00 PM", total:"8h 00m", status:"present" },
            { date:"February 7, 2026", day:"Thursday", in:"—", out:"—", total:"—", status:"absent" },
        ]
    },
    "003": {
        "Feb 4 - 10": [
            { date:"February 4, 2026", day:"Monday", in:"8:00 AM", out:"4:00 PM", total:"8h 00m", status:"present" },
            { date:"February 5, 2026", day:"Tuesday", in:"8:05 AM", out:"4:17 PM", total:"8h 12m", status:"present" },
            { date:"February 6, 2026", day:"Wednesday", in:"9:15 AM", out:"1:00 PM", total:"3h 45m", status:"late" },
            { date:"February 7, 2026", day:"Thursday", in:"8:00 AM", out:"4:00 PM", total:"8h 00m", status:"present" },
        ]
    },
    "004": {
        "Feb 4 - 10": [
            { date:"February 4, 2026", day:"Monday", in:"8:00 AM", out:"4:15 PM", total:"8h 15m", status:"present" },
            { date:"February 5, 2026", day:"Tuesday", in:"8:00 AM", out:"4:00 PM", total:"8h 00m", status:"present" },
            { date:"February 6, 2026", day:"Wednesday", in:"8:05 AM", out:"4:28 PM", total:"8h 23m", status:"present" },
            { date:"February 7, 2026", day:"Thursday", in:"9:00 AM", out:"4:24 PM", total:"7h 24m", status:"late" },
        ]
    }
};

const weekKeys = ["Feb 4 - 10", "Feb 11 - 17", "Feb 18 - 24", "Feb 25 - Mar 3"];
let currentWeekIdx = 0;
let currentMonthIdx = 0; // 0 = Feb 2026
const monthLabels = ["January 2026","February 2026","March 2026","April 2026"];

let currentEmp = null;

function openDetail(emp) {
    currentEmp = emp;
    currentWeekIdx = 0;
    currentMonthIdx = 1; // Feb 2026
    document.getElementById("attendancePage").style.display = "none";
    document.getElementById("employeeDetail").style.display = "block";

    document.getElementById("detailName").textContent = emp.name;
    document.getElementById("detailId").textContent = emp.id;
    document.getElementById("detailPosition").textContent = emp.position;
    document.getElementById("detailDept").textContent = emp.dept;
    document.getElementById("detailType").textContent = emp.type;

    renderWeeklyDetail();
    switchView("weekly");
}

function renderWeeklyDetail() {
    const key = weekKeys[currentWeekIdx] || weekKeys[0];
    document.getElementById("detailWeekLabel").textContent = key;
    const rows = (weeklyData[currentEmp?.id] || {})[key] || [];
    const tbody = document.getElementById("weeklyBody");
    tbody.innerHTML = rows.length
        ? rows.map(r => `
            <tr>
                <td>${r.date}</td><td>${r.day}</td>
                <td>${r.in}</td><td>${r.out}</td><td>${r.total}</td>
                <td><span class="status-pill ${r.status}">${r.status.charAt(0).toUpperCase()+r.status.slice(1)}</span></td>
            </tr>`).join("")
        : `<tr><td colspan="6" style="text-align:center;padding:20px;color:#aaa;">No records for this week.</td></tr>`;
    const totalMins = rows.filter(r=>r.total!=="—").reduce((acc,r)=>{
        const [h,m] = r.total.replace("m","").split("h ").map(Number);
        return acc + (h||0)*60 + (m||0);
    },0);
    document.getElementById("weeklyTotal").textContent = totalMins ? `${Math.floor(totalMins/60)}h ${totalMins%60}m` : "—";
}

function renderMonthlyDetail() {
    const label = monthLabels[currentMonthIdx] || monthLabels[1];
    document.getElementById("detailMonthLabel").textContent = label;
    // Aggregate all weeks for this employee for display
    const allRows = Object.values((weeklyData[currentEmp?.id] || {})).flat();
    const tbody = document.getElementById("monthlyBody");
    tbody.innerHTML = allRows.length
        ? allRows.map(r => `
            <tr>
                <td>${r.date}</td><td>${r.day}</td>
                <td>${r.in}</td><td>${r.out}</td><td>${r.total}</td>
                <td><span class="status-pill ${r.status}">${r.status.charAt(0).toUpperCase()+r.status.slice(1)}</span></td>
            </tr>`).join("")
        : `<tr><td colspan="6" style="text-align:center;padding:20px;color:#aaa;">No records for this month.</td></tr>`;
    const totalMins = allRows.filter(r=>r.total!=="—").reduce((acc,r)=>{
        const [h,m] = r.total.replace("m","").split("h ").map(Number);
        return acc + (h||0)*60 + (m||0);
    },0);
    document.getElementById("monthlyTotal").textContent = totalMins ? `${Math.floor(totalMins/60)}h ${totalMins%60}m` : "—";
}

function switchView(view) {
    document.getElementById("weeklyView").style.display = view === "weekly" ? "block" : "none";
    document.getElementById("monthlyView").style.display = view === "monthly" ? "block" : "none";
    document.getElementById("weeklyViewBtn").classList.toggle("active", view === "weekly");
    document.getElementById("monthlyViewBtn").classList.toggle("active", view === "monthly");
    if (view === "monthly") renderMonthlyDetail();
}

document.getElementById("weeklyViewBtn").addEventListener("click", () => switchView("weekly"));
document.getElementById("monthlyViewBtn").addEventListener("click", () => switchView("monthly"));

document.getElementById("detailPrevWeek").addEventListener("click", () => {
    if (currentWeekIdx > 0) { currentWeekIdx--; renderWeeklyDetail(); }
});
document.getElementById("detailNextWeek").addEventListener("click", () => {
    if (currentWeekIdx < weekKeys.length - 1) { currentWeekIdx++; renderWeeklyDetail(); }
});
document.getElementById("detailPrevMonth").addEventListener("click", () => {
    if (currentMonthIdx > 0) { currentMonthIdx--; renderMonthlyDetail(); }
});
document.getElementById("detailNextMonth").addEventListener("click", () => {
    if (currentMonthIdx < monthLabels.length - 1) { currentMonthIdx++; renderMonthlyDetail(); }
});

document.getElementById("backBtn").addEventListener("click", () => {
    document.getElementById("attendancePage").style.display = "block";
    document.getElementById("employeeDetail").style.display = "none";
});