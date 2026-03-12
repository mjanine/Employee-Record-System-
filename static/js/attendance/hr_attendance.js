/* =========================================================
   hr_attendance.js
   Place at: static/js/attendance/hr_attendance.js
   ========================================================= */

// ── SIDEBAR ──────────────────────────────────────────────
const sidebar = document.getElementById("sidebar");

document.getElementById("closeBtn").addEventListener("click", () => {
    sidebar.classList.add("collapsed");
});

document.getElementById("logoToggle").addEventListener("click", () => {
    sidebar.classList.remove("collapsed");
});

document.querySelectorAll(".menu-item").forEach(item => {
    item.addEventListener("click", () => {
        document.querySelector(".menu-item.active")?.classList.remove("active");
        item.classList.add("active");
    });
});


// ── SAMPLE DATA ───────────────────────────────────────────
// Replace with Django template variables / API calls as needed.

const employees = [
    { id: "001", first: "Juan",   last: "Dela Cruz", position: "Instructor", dept: "College of Computer Studies", type: "Full-Time",  tag: "CCS" },
    { id: "002", first: "Maria",  last: "Santos",    position: "Instructor", dept: "College of Computer Studies", type: "Full-Time",  tag: "CCS" },
    { id: "003", first: "Carlos", last: "Reyes",     position: "Instructor", dept: "College of Computer Studies", type: "Full-Time",  tag: "CCS" },
    { id: "004", first: "Ana",    last: "Garcia",    position: "Instructor", dept: "College of Computer Studies", type: "Part-Time",  tag: "CCS" },
];

// Weekly calendar grid data  [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
const attendanceGrid = {
    "001": [null, { h: "8h 00m", s: "present" }, { h: "4h 36m", s: "late"    }, { h: "",       s: "leave"   }, { h: "8h 39m", s: "present" }, { h: "", s: "active" }, null],
    "002": [null, { h: "6h 24m", s: "late"    }, { h: "8h 00m", s: "present" }, { h: "8h 00m", s: "present" }, { h: "",       s: "absent"  }, { h: "", s: "active" }, null],
    "003": [null, { h: "8h 00m", s: "present" }, { h: "8h 12m", s: "present" }, { h: "3h 45m", s: "late"    }, { h: "8h 00m", s: "present" }, { h: "", s: "leave"  }, null],
    "004": [null, { h: "8h 15m", s: "present" }, { h: "8h 00m", s: "present" }, { h: "8h 23m", s: "present" }, { h: "7h 24m", s: "late"    }, { h: "", s: "active" }, null],
};

// Detail log data  { employeeId: { weekKey: [ rows ] } }
const weeklyLogs = {
    "001": {
        "Feb 4 - 10": [
            { date: "February 4, 2026",  day: "Monday",    in: "8:03 AM", out: "5:02 PM", total: "8h 59m", status: "present" },
            { date: "February 5, 2026",  day: "Tuesday",   in: "8:10 AM", out: "5:00 PM", total: "8h 50m", status: "present" },
            { date: "February 6, 2026",  day: "Wednesday", in: "—",       out: "—",       total: "—",      status: "leave"   },
            { date: "February 7, 2026",  day: "Thursday",  in: "8:00 AM", out: "4:39 PM", total: "8h 39m", status: "present" },
        ],
        "Feb 11 - 17": [
            { date: "February 11, 2026", day: "Monday",    in: "8:20 AM", out: "5:05 PM", total: "8h 45m", status: "late"    },
        ],
    },
    "002": {
        "Feb 4 - 10": [
            { date: "February 4, 2026",  day: "Monday",    in: "9:30 AM", out: "3:54 PM", total: "6h 24m", status: "late"    },
            { date: "February 5, 2026",  day: "Tuesday",   in: "8:00 AM", out: "4:00 PM", total: "8h 00m", status: "present" },
            { date: "February 6, 2026",  day: "Wednesday", in: "8:00 AM", out: "4:00 PM", total: "8h 00m", status: "present" },
            { date: "February 7, 2026",  day: "Thursday",  in: "—",       out: "—",       total: "—",      status: "absent"  },
        ],
    },
    "003": {
        "Feb 4 - 10": [
            { date: "February 4, 2026",  day: "Monday",    in: "8:00 AM", out: "4:00 PM", total: "8h 00m", status: "present" },
            { date: "February 5, 2026",  day: "Tuesday",   in: "8:05 AM", out: "4:17 PM", total: "8h 12m", status: "present" },
            { date: "February 6, 2026",  day: "Wednesday", in: "9:15 AM", out: "1:00 PM", total: "3h 45m", status: "late"    },
            { date: "February 7, 2026",  day: "Thursday",  in: "8:00 AM", out: "4:00 PM", total: "8h 00m", status: "present" },
        ],
    },
    "004": {
        "Feb 4 - 10": [
            { date: "February 4, 2026",  day: "Monday",    in: "8:00 AM", out: "4:15 PM", total: "8h 15m", status: "present" },
            { date: "February 5, 2026",  day: "Tuesday",   in: "8:00 AM", out: "4:00 PM", total: "8h 00m", status: "present" },
            { date: "February 6, 2026",  day: "Wednesday", in: "8:05 AM", out: "4:28 PM", total: "8h 23m", status: "present" },
            { date: "February 7, 2026",  day: "Thursday",  in: "9:00 AM", out: "4:24 PM", total: "7h 24m", status: "late"    },
        ],
    },
};

const WEEK_KEYS   = ["Feb 4 - 10", "Feb 11 - 17", "Feb 18 - 24", "Feb 25 - Mar 3"];
const MONTH_KEYS  = ["January 2026", "February 2026", "March 2026", "April 2026"];


// ── HELPERS ───────────────────────────────────────────────

function badgeHTML(rec) {
    if (!rec) return `<span style="opacity:0.3">—</span>`;
    const icons = { present: "check-circle", late: "clock", leave: "moon", absent: "times-circle", active: "circle" };
    const label = rec.s === "present" ? (rec.h || "Present")
                : rec.s === "late"    ? (rec.h || "Late")
                : rec.s.charAt(0).toUpperCase() + rec.s.slice(1);
    return `<span class="badge ${rec.s}"><i class="fas fa-${icons[rec.s] || "circle"}"></i>${label}</span>`;
}

function calcTotal(rows) {
    const mins = rows
        .filter(r => r.total !== "—")
        .reduce((acc, r) => {
            const parts = r.total.replace("m", "").split("h ");
            return acc + (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
        }, 0);
    return mins ? `${Math.floor(mins / 60)}h ${mins % 60}m` : "—";
}

function buildLogRows(rows) {
    if (!rows.length) {
        return `<tr><td colspan="6" style="text-align:center;padding:20px;color:#aaa;">No records found.</td></tr>`;
    }
    return rows.map(r => `
        <tr>
            <td>${r.date}</td>
            <td>${r.day}</td>
            <td>${r.in}</td>
            <td>${r.out}</td>
            <td>${r.total}</td>
            <td><span class="status-pill ${r.status}">${r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span></td>
        </tr>`).join("");
}


// ── MAIN TABLE ────────────────────────────────────────────

let currentWeek = 5;

function renderTable(data) {
    const tbody = document.getElementById("attendanceBody");
    tbody.innerHTML = "";

    data.forEach(emp => {
        const rec = attendanceGrid[emp.id] || [];
        const tr  = document.createElement("tr");
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

    // Click employee row → open detail
    document.querySelectorAll(".emp-cell").forEach(cell => {
        cell.addEventListener("click", () => {
            const emp = employees.find(e => e.id === cell.dataset.id);
            if (emp) openDetail(emp);
        });
    });
}

// Week navigation
document.getElementById("weekLabel").textContent = `Week ${currentWeek}`;

document.getElementById("prevWeek").addEventListener("click", () => {
    if (currentWeek > 1) currentWeek--;
    document.getElementById("weekLabel").textContent = `Week ${currentWeek}`;
});

document.getElementById("nextWeek").addEventListener("click", () => {
    currentWeek++;
    document.getElementById("weekLabel").textContent = `Week ${currentWeek}`;
});

// Live search
document.getElementById("searchInput").addEventListener("input", function () {
    const q = this.value.toLowerCase();
    renderTable(employees.filter(e =>
        e.first.toLowerCase().includes(q) ||
        e.last.toLowerCase().includes(q)  ||
        e.id.includes(q)                  ||
        e.dept.toLowerCase().includes(q)  ||
        e.position.toLowerCase().includes(q)
    ));
});

// Initial render
renderTable(employees);


// ── EMPLOYEE DETAIL ───────────────────────────────────────

let activeEmp  = null;
let weekIdx    = 0;
let monthIdx   = 1; // default: February 2026

function openDetail(emp) {
    activeEmp = emp;
    weekIdx   = 0;
    monthIdx  = 1;

    // Swap views
    document.getElementById("attendancePage").style.display  = "none";
    document.getElementById("employeeDetail").style.display  = "block";

    // Populate info panel
    document.getElementById("detailName").textContent     = `${emp.last}, ${emp.first}`;
    document.getElementById("detailId").textContent       = emp.id;
    document.getElementById("detailPosition").textContent = emp.position;
    document.getElementById("detailDept").textContent     = emp.dept;
    document.getElementById("detailType").textContent     = emp.type;

    renderWeeklyDetail();
    switchView("weekly");
}

function renderWeeklyDetail() {
    const key  = WEEK_KEYS[weekIdx] || WEEK_KEYS[0];
    const rows = (weeklyLogs[activeEmp?.id] || {})[key] || [];

    document.getElementById("detailWeekLabel").textContent = key;
    document.getElementById("weeklyBody").innerHTML        = buildLogRows(rows);
    document.getElementById("weeklyTotal").textContent     = calcTotal(rows);
}

function renderMonthlyDetail() {
    const rows = Object.values(weeklyLogs[activeEmp?.id] || {}).flat();

    document.getElementById("detailMonthLabel").textContent = MONTH_KEYS[monthIdx] || MONTH_KEYS[1];
    document.getElementById("monthlyBody").innerHTML         = buildLogRows(rows);
    document.getElementById("monthlyTotal").textContent      = calcTotal(rows);
}

function switchView(view) {
    document.getElementById("weeklyView").style.display  = view === "weekly"  ? "block" : "none";
    document.getElementById("monthlyView").style.display = view === "monthly" ? "block" : "none";
    document.getElementById("weeklyViewBtn").classList.toggle("active",  view === "weekly");
    document.getElementById("monthlyViewBtn").classList.toggle("active", view === "monthly");
    if (view === "monthly") renderMonthlyDetail();
}

// View toggle buttons
document.getElementById("weeklyViewBtn").addEventListener("click",  () => switchView("weekly"));
document.getElementById("monthlyViewBtn").addEventListener("click", () => switchView("monthly"));

// Weekly navigation
document.getElementById("detailPrevWeek").addEventListener("click", () => {
    if (weekIdx > 0) { weekIdx--; renderWeeklyDetail(); }
});
document.getElementById("detailNextWeek").addEventListener("click", () => {
    if (weekIdx < WEEK_KEYS.length - 1) { weekIdx++; renderWeeklyDetail(); }
});

// Monthly navigation
document.getElementById("detailPrevMonth").addEventListener("click", () => {
    if (monthIdx > 0) { monthIdx--; renderMonthlyDetail(); }
});
document.getElementById("detailNextMonth").addEventListener("click", () => {
    if (monthIdx < MONTH_KEYS.length - 1) { monthIdx++; renderMonthlyDetail(); }
});

// Back button
document.getElementById("backBtn").addEventListener("click", () => {
    document.getElementById("attendancePage").style.display = "block";
    document.getElementById("employeeDetail").style.display = "none";
});