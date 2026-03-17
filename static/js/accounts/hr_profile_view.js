let currentDocRow = null; 
let pendingFile = null;
let pendingBase64 = null;

let employees = JSON.parse(localStorage.getItem('addedEmployees')) || [];
const params = new URLSearchParams(window.location.search);
const empID = params.get('id');
const source = params.get('source'); 

let employmentHistory = [];

function updateDocumentCount() {
    const countDisplay = document.getElementById('docCountText');
    if (!countDisplay) return;
    const rows = document.querySelectorAll('table tbody tr');
    let uploaded = 0;
    rows.forEach(row => {
        const statusText = row.cells[2].innerText.trim().toLowerCase();
        if (statusText !== "missing" && statusText !== "---") {
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
    
    document.getElementById('modalDocName').innerText = docName;
    document.getElementById('modalFileName').innerText = fileName;
    
    if (deleteBtn) deleteBtn.style.display = (fileName !== "---" && fileName !== "") ? "flex" : "none";
    modal.style.display = 'flex';
    wrapper.innerHTML = ""; 

    if (fileName === "---" || !fileName) {
        wrapper.innerHTML = `<div style="text-align:center; color:#000;"><p>No document attached.</p></div>`;
    } else {
        if (fileName.toLowerCase().endsWith('.pdf')) {
            wrapper.innerHTML = `<iframe src="${url}" width="100%" height="100%" style="border:none;"></iframe>`;
        } else {
            wrapper.innerHTML = `<img src="${url}" style="max-height: 90%; max-width: 90%; object-fit: contain;">`;
        }
    }
}

window.handleFileSelection = function(input) {
    const file = input.files[0];
    if (file) {
        pendingFile = file;
        const reader = new FileReader();
        document.getElementById('modalFileName').innerText = file.name;
        document.getElementById('saveBtn').style.display = 'flex';
        
        reader.onload = function(e) {
            pendingBase64 = e.target.result;
            const wrapper = document.getElementById('modalPreviewWrapper');
            if (file.type === "application/pdf") {
                wrapper.innerHTML = `<iframe src="${pendingBase64}" width="100%" height="100%" style="border:none;"></iframe>`;
            } else {
                wrapper.innerHTML = `<img src="${pendingBase64}" style="max-height: 90%; max-width: 90%; object-fit: contain;">`;
            }
        }
        reader.readAsDataURL(file);
    }
}

window.saveDocumentChanges = function() {
    if (currentDocRow && pendingBase64) {
        const cells = currentDocRow.getElementsByTagName('td');
        const docName = cells[0].innerText; 
        const fileExt = pendingFile.name.split('.').pop().toUpperCase();

        let employeesList = JSON.parse(localStorage.getItem('addedEmployees')) || [];
        let empIdx = employeesList.findIndex(e => e.id === empID);
        if (empIdx !== -1) {
            if (!employeesList[empIdx].documents) employeesList[empIdx].documents = {};
            employeesList[empIdx].documents[docName] = { 
                status: "Valid", 
                file: pendingFile.name, 
                url: pendingBase64,
                date: new Date().toLocaleDateString() 
            };
            localStorage.setItem('addedEmployees', JSON.stringify(employeesList));
        }

        window.closeModal();
        pendingFile = null;
        pendingBase64 = null;
        location.reload();
    }
}

window.handleDelete = function() {
    if (confirm("Delete this document?")) {
        const cells = currentDocRow.getElementsByTagName('td');
        const docName = cells[0].innerText;
        
        let employeesList = JSON.parse(localStorage.getItem('addedEmployees')) || [];
        let empIdx = employeesList.findIndex(e => e.id === empID);
        if (empIdx !== -1 && employeesList[empIdx].documents) {
            delete employeesList[empIdx].documents[docName];
            localStorage.setItem('addedEmployees', JSON.stringify(employeesList));
        }

        window.closeModal();
        location.reload();
    }
}

window.closeModal = function() {
    document.getElementById('documentModal').style.display = 'none';
    if(document.getElementById('modalPreviewWrapper')) document.getElementById('modalPreviewWrapper').innerHTML = "";
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
        row.style.cssText = "display:flex; flex-direction:column; gap:8px; border-bottom:1px solid #eee; padding:15px 0;";
        row.innerHTML = `
            <div style="display:flex; gap:10px; align-items:center;">
                <input type="text" value="${item.date}" id="edit-date-${index}" style="width:120px; font-size:12px; padding:5px; border-radius:5px; border:1px solid #ccc;">
                <input type="text" value="${item.type}" id="edit-type-${index}" style="flex:1; font-weight:bold; padding:5px; border-radius:5px; border:1px solid #ccc;">
                <button onclick="removeHistoryRow(${index})" style="color:red; background:none; border:none; cursor:pointer; font-size:16px;">✕</button>
            </div>
            <div style="display:flex; gap:10px;">
                <input type="text" value="${item.from || ''}" id="edit-from-${index}" placeholder="From" style="flex:1; font-size:11px; padding:5px; border:1px solid #eee; border-radius:4px;">
                <input type="text" value="${item.to || ''}" id="edit-to-${index}" placeholder="To" style="flex:1; font-size:11px; padding:5px; border:1px solid #eee; border-radius:4px;">
            </div>
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
        color: item.color || "blue"
    }));

    let employeesList = JSON.parse(localStorage.getItem('addedEmployees')) || [];
    let empIdx = employeesList.findIndex(e => e.id === empID);
    if (empIdx !== -1) {
        employeesList[empIdx].history = employmentHistory;
        localStorage.setItem('addedEmployees', JSON.stringify(employeesList));
    }

    updateMainHistoryUI();
    closeHistoryModal();
};

window.updateMainHistoryUI = function() {
    const container = document.getElementById('mainHistoryTimeline');
    if (!container) return;

    if (employmentHistory.length === 0) {
        container.innerHTML = `<p style="color:#000; padding:10px;">No records found.</p>`;
        return;
    }

    container.innerHTML = employmentHistory.map(item => `
        <div class="timeline-item">
            <div class="timeline-date" style="color:#000;">${item.date}</div>
            <div class="timeline-marker"><span class="dot ${item.color}"></span></div>
            <div class="timeline-content" style="color:#000;">
                <div class="history-header"><strong>${item.type}</strong></div>
                <div class="history-details">
                    <p>From: ${item.from} | To: ${item.to}</p>
                </div>
            </div>
        </div>`).join('');
}

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const logoToggle = document.getElementById('logoToggle');

    const handleToggle = () => sidebar.classList.toggle('close');
    if (closeBtn) closeBtn.onclick = handleToggle;
    if (logoToggle) logoToggle.onclick = handleToggle;

    const employeesList = JSON.parse(localStorage.getItem('addedEmployees')) || [];
    const empData = employeesList.find(e => e.id === empID);

    if (empData) {
        if (empData.photo) document.getElementById('profImage').src = empData.photo;
        document.getElementById('profName').textContent = empData.fullName;
        document.getElementById('profRoleHeader').textContent = empData.pos;
        document.getElementById('profID').textContent = "Employee ID: " + empData.id;
        document.getElementById('profStatusText').textContent = empData.status;
        document.getElementById('profPos').textContent = empData.pos;
        document.getElementById('profDept').textContent = empData.dept;
        document.getElementById('profType').textContent = empData.empType || "---";
        document.getElementById('profDateHired').textContent = empData.dateHired || "---";
        document.getElementById('profEmail').textContent = empData.email || "N/A";
        document.getElementById('profContact').textContent = empData.contact || "N/A";
        document.getElementById('profAddress').textContent = empData.address || "N/A";

        const statusDot = document.getElementById('statusDot');
        const status = empData.status.toLowerCase();
        if (status === "active") statusDot.style.backgroundColor = "#8ddf9b";
        else if (status === "inactive") statusDot.style.backgroundColor = "#f5a9a9";
        else if (status === "on leave") statusDot.style.backgroundColor = "#f3e08c";

        employmentHistory = empData.history || [];

        // --- ROLE-BASED SIDEBAR HIGHLIGHT ---
        const menuItems = document.querySelectorAll('.menu-item');
        const userPosition = empData.pos.toLowerCase();

        menuItems.forEach(item => {
            item.classList.remove('active');
            const icon = item.querySelector('i');

            // If the person being viewed is HR or Admin, highlight Profile
            if (userPosition.includes('hr') || userPosition.includes('admin')) {
                if (icon && icon.classList.contains('fa-user')) {
                    item.classList.add('active');
                }
            } 
            // Otherwise, keep highlighting Employee Records
            else {
                if (icon && icon.classList.contains('fa-database')) {
                    item.classList.add('active');
                }
            }
        });
    }

    const editBtn = document.getElementById('editProfileBtn');
    if (editBtn) {
        editBtn.onclick = () => {
            window.location.href = `hr_profile_edit.html?id=${empID}`;
        };
    }

    const tabs = document.querySelectorAll('.tab');
    function loadTabContent(file) {
        fetch(file).then(r => r.text()).then(d => {
            document.getElementById('tab-content-container').innerHTML = d;
            
            if (file.includes('department')) {
                const infoRows = document.querySelectorAll('.info-row');
                infoRows.forEach(row => {
                    const labelSpan = row.querySelector('span:first-child');
                    const valueSpan = row.querySelector('span:last-child');
                    if (!labelSpan || !valueSpan) return;

                    const label = labelSpan.textContent.trim();
                    valueSpan.style.color = "#000"; 
                    valueSpan.style.fontWeight = "normal";

                    if (label === "Department / Office") valueSpan.textContent = empData.dept;
                    if (label === "Position") valueSpan.textContent = empData.pos;
                    if (label === "Department Code") {
                        const codeMap = { "Registrar": "REG - 101", "Computer": "CCS - 201", "Engineering": "COE - 301", "Medicine": "MED - 401", "Humanities": "CAS - 501", "Business": "CBA - 601" };
                        let code = "GEN - 101";
                        for(let key in codeMap) { if(empData.dept.includes(key)) code = codeMap[key]; }
                        valueSpan.textContent = code;
                    }
                    if (label === "Office Location") {
                        if(empData.dept.includes("Registrar")) valueSpan.textContent = "Ground Floor, Admin Building";
                        else if(empData.dept.includes("Computer")) valueSpan.textContent = "Main building 2nd floor";
                        else if(empData.dept.includes("Engineering")) valueSpan.textContent = "4th Floor, East Building";
                        else valueSpan.textContent = "Main Campus Area";
                    }
                    if (label === "Contact email") {
                         valueSpan.textContent = empData.dept.toLowerCase().split(' ')[0] + ".admin@perpetualdalta.edu.ph";
                    }
                });
            }

            if (file.includes('documents')) {
                const rows = document.querySelectorAll('table tbody tr');
                rows.forEach(row => {
                    const docName = row.cells[0].innerText.trim();
                    const savedDoc = (empData && empData.documents && empData.documents[docName]);
                    
                    if (!savedDoc) {
                        row.cells[1].innerText = "---";
                        row.cells[2].innerHTML = `<span style="display: inline-block; width: 8px; height: 8px; background: #dc3545; border-radius: 50%; margin-right: 5px;"></span>Missing`;
                        row.cells[3].innerText = "---";
                        row.cells[4].innerHTML = `<span onclick="window.openModal('${docName}', '---', '', '', this)" style="color: #7b3f3f; font-weight: bold; cursor: pointer; text-decoration: underline;">Add file</span>`;
                    } else {
                        row.cells[1].innerText = savedDoc.file.split('.').pop().toUpperCase();
                        row.cells[2].innerHTML = `<span style="display: inline-block; width: 8px; height: 8px; background: #28a745; border-radius: 50%; margin-right: 5px;"></span>Valid`;
                        row.cells[3].innerText = savedDoc.date;
                        row.cells[4].innerHTML = `<span onclick="window.openModal('${docName}', '${savedDoc.file}', 'file', '${savedDoc.url}', this)" style="color: #7b3f3f; font-weight: bold; cursor: pointer;">View</span>`;
                    }
                });
            }

            if(file.includes('history')) updateMainHistoryUI();
            updateDocumentCount();
        });
    }

    loadTabContent('hr_department_employee.html');
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadTabContent(`${tab.getAttribute('data-tab')}.html`);
        };
    });
});

window.onclick = (event) => {
    if (event.target == document.getElementById('documentModal')) closeModal();
    if (event.target == document.getElementById('historyModal')) closeHistoryModal();
};
