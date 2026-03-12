const empInfo = { name: "Jose Brian Dela Peña" };
const leaveData = [
    { dateFiled: "April 01, 2026", leaveType: "Sick Leave", startDate: "April 05, 2026", endDate: "April 07, 2026", numDays: 2, status: "Pending", reviewedBy: "---", submitTime: "10:12 A.M" },
    { dateFiled: "March 10, 2026", leaveType: "Vacation Leave", startDate: "March 20, 2026", endDate: "March 25, 2026", numDays: 5, status: "Approved", reviewedBy: "HR Manager", submitTime: "02:45 P.M" }
];

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const tabRequests = document.getElementById('tab-requests');
    const tabHistory = document.getElementById('tab-history');
    const requestsContent = document.getElementById('requests-content');
    const historyContent = document.getElementById('history-content');

    // Set Data
    document.getElementById('display-emp-name').innerText = empInfo.name;
    renderTables();

    // SIDEBAR TOGGLE
    closeBtn.addEventListener("click", () => sidebar.classList.add("collapsed"));
    logoToggle.addEventListener("click", () => {
        if (sidebar.classList.contains("collapsed")) sidebar.classList.remove("collapsed");
    });

    // TOOLTIPS
    document.querySelectorAll('.menu-item').forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.innerText);
    });

    // TABS
    tabRequests.onclick = () => {
        tabRequests.classList.add('active'); tabHistory.classList.remove('active');
        requestsContent.style.display = 'block'; historyContent.style.display = 'none';
    };
    tabHistory.onclick = () => {
        tabHistory.classList.add('active'); tabRequests.classList.remove('active');
        historyContent.style.display = 'block'; requestsContent.style.display = 'none';
    };
});

function renderTables() {
    const reqBody = document.getElementById('requests-table-body');
    const histBody = document.getElementById('history-table-body');
    reqBody.innerHTML = ""; histBody.innerHTML = "";
    leaveData.forEach((leave, index) => {
        const row = `<tr class="table-row">
            <td>${leave.dateFiled}</td>
            <td><span class="type-badge">${leave.leaveType}</span></td>
            <td>${leave.startDate}</td>
            <td>${leave.endDate}</td>
            <td>${leave.numDays}</td>
            <td><span class="status-pill ${leave.status.toLowerCase()}">${leave.status}</span></td>
            <td>${leave.reviewedBy}</td>
            <td><button class="view-btn" onclick="openViewModal(${index})">View</button></td>
        </tr>`;
        leave.status === "Pending" ? reqBody.innerHTML += row : histBody.innerHTML += row;
    });
}

function openViewModal(index) {
    const data = leaveData[index];
    document.getElementById('modalFileName').innerText = data.leaveType.replace(" ", "_") + ".pdf";
    document.getElementById('modalSubmitDate').innerText = `${data.dateFiled} - ${data.submitTime}`;
    document.getElementById('modalStatusContainer').innerHTML = `<span class="status-pill ${data.status.toLowerCase()}">${data.status}</span>`;
    document.getElementById('viewModal').style.display = 'flex';
}

function closeViewModal() { document.getElementById('viewModal').style.display = 'none'; }