let currentDocRow = null; 
let pendingFile = null;

let employmentHistory = [
    { date: "January 14, 2025", type: "Status Change", from: "Active", to: "On Leave", color: "yellow" },
    { date: "January 14, 2020", type: "Department Transfer", from: "Registrar", to: "College of Computer Studies (CCS)", color: "blue" }
];

function updateDocumentCount() {
    const countDisplay = document.getElementById('docCountText');
    if (!countDisplay) return;
    const rows = document.querySelectorAll('table tbody tr');
    let uploaded = 0;
    rows.forEach(row => {
        if (row.cells[2].innerText.trim().toLowerCase() !== "missing") {
            uploaded++;
        }
    });
    countDisplay.innerText = `${uploaded} of ${rows.length} required documents uploaded`;
}

window.openModal = function(docName, fileName, type, url, element) {
    currentDocRow = element ? element.closest('tr') : null; 
    const modal = document.getElementById('documentModal');
    const wrapper = document.getElementById('modalPreviewWrapper');
    const deleteBtn = document.getElementById('deleteBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    document.getElementById('modalDocName').innerText = docName;
    document.getElementById('modalFileName').innerText = fileName;
    saveBtn.style.display = 'none';
    
    deleteBtn.style.display = (fileName !== "---") ? "flex" : "none";
    modal.style.display = 'flex';
    wrapper.innerHTML = ""; 

    if (fileName === "---") {
        wrapper.innerHTML = `<div style="text-align:center; color:#999;"><p>No document attached.</p></div>`;
    } else if (type === 'pdf') {
        wrapper.innerHTML = `<iframe src="${url}" width="100%" height="100%" style="border:none;"></iframe>`;
    } else {
        wrapper.innerHTML = `<img src="${url}" style="max-height: 90%; max-width: 90%; object-fit: contain;">`;
    }
}

function handleFileSelection(input) {
    const file = input.files[0];
    if (file) {
        pendingFile = file;
        const reader = new FileReader();
        document.getElementById('modalFileName').innerText = file.name;
        document.getElementById('saveBtn').style.display = 'flex';
        
        reader.onload = function(e) {
            const wrapper = document.getElementById('modalPreviewWrapper');
            if (file.type === "application/pdf") {
                wrapper.innerHTML = `<iframe src="${e.target.result}" width="100%" height="100%" style="border:none;"></iframe>`;
            } else {
                wrapper.innerHTML = `<img src="${e.target.result}" style="max-height: 90%; max-width: 90%; object-fit: contain;">`;
            }
        }
        reader.readAsDataURL(file);
    }
}

function saveDocumentChanges() {
    if (currentDocRow && pendingFile) {
        const cells = currentDocRow.getElementsByTagName('td');
        const fileExt = pendingFile.name.split('.').pop().toUpperCase();
        const fileUrl = URL.createObjectURL(pendingFile);
        const fileType = pendingFile.type.includes('pdf') ? 'pdf' : 'image';

        cells[1].innerText = fileExt;
        cells[2].innerHTML = `<span style="display: inline-block; width: 8px; height: 8px; background: #28a745; border-radius: 50%; margin-right: 5px;"></span>Valid`;
        cells[3].innerText = new Date().toLocaleDateString();

        const actionCell = cells[4];
        actionCell.innerHTML = `<span onclick="openModal('${cells[0].innerText}', '${pendingFile.name}', '${fileType}', '${fileUrl}', this)" style="color: #7b3f3f; font-weight: bold; cursor: pointer;">View</span>`;
        
        closeModal();
        pendingFile = null;
        updateDocumentCount();
    }
}

function handleDelete() {
    if (confirm("Delete this document?") && currentDocRow) {
        const cells = currentDocRow.getElementsByTagName('td');
        cells[1].innerText = "---";
        cells[2].innerHTML = `<span style="display: inline-block; width: 8px; height: 8px; background: #dc3545; border-radius: 50%; margin-right: 5px;"></span>Missing`;
        cells[3].innerText = "---";
        cells[4].innerHTML = `<span onclick="openModal('${cells[0].innerText}', '---', '', '', this)" style="color: #7b3f3f; font-weight: bold; cursor: pointer; text-decoration: underline;">Add file</span>`;
        
        closeModal();
        updateDocumentCount();
    }
}

window.closeModal = function() {
    document.getElementById('documentModal').style.display = 'none';
    document.getElementById('modalPreviewWrapper').innerHTML = "";
}

window.openHistoryModal = function() {
    renderHistoryModalRows();
    document.getElementById('historyModal').style.display = 'flex';
};

window.closeHistoryModal = function() {
    document.getElementById('historyModal').style.display = 'none';
};

function renderHistoryModalRows() {
    const container = document.getElementById('modalTimelineList');
    if(!container) return;
    container.innerHTML = "";
    employmentHistory.forEach((item, index) => {
        const row = document.createElement('div');
        row.style.cssText = "display:flex; gap:10px; border-bottom:1px solid #eee; padding:10px 0; align-items:center;";
        row.innerHTML = `
            <input type="text" value="${item.date}" id="edit-date-${index}" style="width:100px; font-size:12px;">
            <input type="text" value="${item.type}" id="edit-type-${index}" style="flex:1; font-weight:bold;">
            <input type="text" value="${item.from}" id="edit-from-${index}" style="width:80px;">
            <input type="text" value="${item.to}" id="edit-to-${index}" style="width:80px;">
            <button onclick="removeHistoryRow(${index})" style="color:red; background:none; border:none; cursor:pointer;">✕</button>
        `;
        container.appendChild(row);
    });
}

window.addNewHistoryRow = function() {
    employmentHistory.unshift({ date: "New Date", type: "New Event", from: "---", to: "---", color: "blue" });
    renderHistoryModalRows();
};

window.removeHistoryRow = function(index) {
    employmentHistory.splice(index, 1);
    renderHistoryModalRows();
};

window.saveHistoryChanges = function() {
    employmentHistory = employmentHistory.map((item, index) => ({
        date: document.getElementById(`edit-date-${index}`).value,
        type: document.getElementById(`edit-type-${index}`).value,
        from: document.getElementById(`edit-from-${index}`).value,
        to: document.getElementById(`edit-to-${index}`).value,
        color: item.color
    }));
    updateMainHistoryUI();
    closeHistoryModal();
};

function updateMainHistoryUI() {
    const container = document.getElementById('mainHistoryTimeline');
    if (!container) return;
    container.innerHTML = employmentHistory.map(item => `
        <div class="timeline-item">
            <div class="timeline-date">${item.date}</div>
            <div class="timeline-marker"><span class="dot ${item.color}"></span></div>
            <div class="timeline-content">
                <div class="history-header"><strong>${item.type}</strong></div>
                <div class="history-details">
                    <p>From: <strong>${item.from}</strong></p>
                    <p>To: <strong>${item.to}</strong></p>
                </div>
            </div>
        </div>`).join('');
}

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const empID = params.get('id');
    const employees = JSON.parse(localStorage.getItem('addedEmployees')) || [];
    const empData = employees.find(e => e.id === empID);

    if (empData) {
        const profileImg = document.querySelector('.profile-img');
        const defaultPic = "../../static/img/sample-profile-pic.jfif";
        profileImg.src = empData.photo ? empData.photo : defaultPic;

        document.getElementById('profName').textContent = empData.fullName;
        document.getElementById('profRoleHeader').textContent = empData.pos;
        document.getElementById('profID').textContent = "Employee ID: " + empData.id;
        document.getElementById('profStatusText').textContent = empData.status;
        document.getElementById('profPos').textContent = empData.pos;
        document.getElementById('profDept').textContent = empData.dept;
        document.getElementById('profType').textContent = empData.empType || "N/A";
        document.getElementById('profDateHired').textContent = empData.dateHired || "N/A";
        document.getElementById('profEmail').textContent = empData.email || "N/A";
        document.getElementById('profContact').textContent = empData.contact || "N/A";
        document.getElementById('profAddress').textContent = empData.address || "N/A";

        const statusDot = document.getElementById('statusDot');
        const status = empData.status ? empData.status.toLowerCase() : "";
        if (status === "active") statusDot.style.backgroundColor = "#8ddf9b";
        else if (status === "inactive") statusDot.style.backgroundColor = "#f5a9a9";
        else if (status === "on leave") statusDot.style.backgroundColor = "#f3e08c";
        else statusDot.style.backgroundColor = "#bbb";

        document.getElementById('editProfileBtn').onclick = function() {
            window.location.href = `profile_edit.html?id=${empData.id}&source=profile`;
        };
    }

    const tabs = document.querySelectorAll('.tab');
    const tabContentContainer = document.getElementById('tab-content-container');
    
    function loadTabContent(file) {
        const fetchPath = `../hr/employee_management/${file}`;
        fetch(fetchPath)
            .then(r => r.text())
            .then(d => {
                tabContentContainer.innerHTML = d;
                if(file.includes('history')) updateMainHistoryUI();
                updateDocumentCount();
            })
            .catch(err => console.error("Error loading tab:", err));
    }

    loadTabContent('department_employee.html');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadTabContent(`${tab.getAttribute('data-tab')}.html`);
        });
    });
});

window.onclick = function(event) {
    if (event.target == document.getElementById('documentModal')) closeModal();
    if (event.target == document.getElementById('historyModal')) closeHistoryModal();
}