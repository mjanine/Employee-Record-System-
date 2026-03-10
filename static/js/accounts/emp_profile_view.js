document.addEventListener('DOMContentLoaded', function() {
    const targetID = "001"; 

    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const logoToggle = document.getElementById('logoToggle');
    const handleToggle = () => sidebar.classList.toggle('collapsed');
    if (closeBtn) closeBtn.onclick = handleToggle;
    if (logoToggle) logoToggle.onclick = handleToggle;

    function getEmployeeData() {
        const employees = JSON.parse(localStorage.getItem('addedEmployees')) || [];
        return employees.find(e => e.id === targetID);
    }

    function syncHeader() {
        const data = getEmployeeData();
        if (!data) return;
        if (data.photo) document.getElementById('profImage').src = data.photo;
        document.getElementById('profName').innerText = data.fullName;
        document.getElementById('profRoleHeader').innerText = data.pos;
        document.getElementById('profID').innerText = "Employee ID: " + data.id;
        document.getElementById('profStatusText').innerText = data.status;
        document.getElementById('profPos').innerText = data.pos;
        document.getElementById('profDept').innerText = data.dept;
        document.getElementById('profType').innerText = data.empType || "---";
        document.getElementById('profDateHired').innerText = data.dateHired || "---";
        document.getElementById('profEmail').innerText = data.email || "---";
        document.getElementById('profContact').innerText = data.contact || "---";
        document.getElementById('profAddress').innerText = data.address || "---";

        const dot = document.getElementById('statusDot');
        const s = data.status.toLowerCase();
        if (dot) dot.style.backgroundColor = s === "active" ? "#8ddf9b" : (s === "on leave" ? "#f3e08c" : "#f5a9a9");
    }

    function renderTab(tabName) {
        const data = getEmployeeData();
        const container = document.getElementById('tab-content-container');
        if (!data) return;

        if (tabName === 'emp_department_view') {
            const codeMap = { "Registrar": "REG - 101", "Computer": "CCS - 201", "Engineering": "COE - 301", "Medicine": "MED - 401", "Arts": "CAS - 501", "Business": "CBA - 601" };
            let deptCode = "GEN - 101";
            for(let key in codeMap) { if(data.dept.includes(key)) deptCode = codeMap[key]; }

            let officeLoc = "Main Campus Area";
            if(data.dept.includes("Registrar")) officeLoc = "Ground Floor, Admin Building";
            else if(data.dept.includes("Computer")) officeLoc = "Main building 2nd floor";
            else if(data.dept.includes("Engineering")) officeLoc = "4th Floor, East Building";

            container.innerHTML = `
                <div style="background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #e2e2e2; color: #000;">
                    <h4 style="background-color: #ECECEC; padding: 10px; margin: -20px -20px 15px -20px; border-radius: 12px 12px 0 0; font-weight: normal;">Department Information</h4>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                        <span>Department / Office</span> <span>${data.dept}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                        <span>Department Code</span> <span>${deptCode}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                        <span>Office Location</span> <span>${officeLoc}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                        <span>Contact email</span> <span>${data.dept.toLowerCase().split(' ')[0]}.admin@perpetualdalta.edu.ph</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                        <span>Contact Number</span> <span>+63 912 345 6789</span>
                    </div>
                </div>`;
        } 
        
        else if (tabName === 'emp_documents_view') {
            const requiredDocs = ["Transcript of Records", "Licenses / Certification", "NBI Clearance"];
            const savedDocs = data.documents || {};
            let uploadedCount = 0;
            
            let rows = requiredDocs.map(name => {
                const info = savedDocs[name] || { status: "Missing", date: "---", file: "---", url: "" };
                const dotColor = info.status === "Valid" ? "#28a745" : "#dc3545";
                const fileExt = info.file !== "---" ? info.file.split('.').pop().toUpperCase() : "---";
                if (info.status === "Valid") uploadedCount++;
                
                return `
                <tr style="color: #000; border-bottom: 1px solid #eee;">
                    <td style="padding:15px 10px;">${name}</td>
                    <td style="padding:15px 10px;">${fileExt}</td>
                    <td style="padding:15px 10px;">
                        <span style="display:inline-block; width:8px; height:8px; background:${dotColor}; border-radius:50%; margin-right:5px;"></span>${info.status}
                    </td>
                    <td style="padding:15px 10px;">${info.date}</td>
                    <td style="padding:15px 10px;">
                        ${info.url ? `<button onclick="window.openEmpDoc('${name}', '${info.file}', '${info.url}')" style="color:#7b3f3f; background:none; border:none; cursor:pointer; font-weight:bold;">View</button>` : '---'}
                    </td>
                </tr>`;
            }).join('');

            container.innerHTML = `
                <div style="background: #fff; border-radius: 12px; border: 1px solid #e2e2e2; color: #000; overflow: hidden;">
                    <div style="background-color: #ECECEC; padding: 12px 20px; color: #555; font-size: 13px;">
                        ${uploadedCount} of ${requiredDocs.length} required documents uploaded
                    </div>
                    <div style="padding: 20px;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead style="text-align:left; color:#888; font-size:12px; border-bottom: 2px solid #eee;">
                                <tr>
                                    <th style="padding:10px;">Document Name</th>
                                    <th style="padding:10px;">File Type</th>
                                    <th style="padding:10px;">Status</th>
                                    <th style="padding:10px;">Date Uploaded</th>
                                    <th style="padding:10px;">Action</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                </div>`;
        }

        else if (tabName === 'emp_employment-history_view') {
            const history = data.history || [];
            
            if (history.length === 0) {
                container.innerHTML = `
                    <div style="background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #e2e2e2; color: #000;">
                        <h4 style="background-color: #ECECEC; padding: 10px; margin: -20px -20px 15px -20px; border-radius: 12px 12px 0 0; font-weight: normal; margin-bottom: 25px;">Employment History</h4>
                        <p style="margin-top: 10px;">No records found.</p>
                    </div>`;
                return;
            }

            let timelineItems = history.map(item => `
                <div class="timeline-item" style="display: flex; margin-bottom: 30px; position: relative; color: #000;">
                    <div style="width: 100px; text-align: right; padding-right: 20px; font-size: 12px; color: #999;">${item.date}</div>
                    <div style="width: 2px; background: #eee; position: relative;">
                        <span style="position: absolute; left: -5px; top: 0; width: 12px; height: 12px; background: ${item.color === 'yellow' ? '#f3e08c' : '#9abed7'}; border-radius: 50%; border: 2px solid #fff;"></span>
                    </div>
                    <div style="flex: 1; padding-left: 20px;">
                        <div style="font-weight: bold; margin-bottom: 5px;">${item.type}</div>
                        <div style="font-size: 13px; color: #555;">From: ${item.from} | To: ${item.to}</div>
                    </div>
                </div>`).join('');

            container.innerHTML = `
                <div style="background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #e2e2e2; color: #000;">
                    <h4 style="background-color: #ECECEC; padding: 10px; margin: -20px -20px 15px -20px; border-radius: 12px 12px 0 0; font-weight: normal; margin-bottom: 25px;">Employment History</h4>
                    <div style="padding-top: 10px;">${timelineItems}</div>
                </div>`;
        }
    }

    syncHeader();
    renderTab('emp_department_view');

    document.querySelectorAll('.tab').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            renderTab(btn.getAttribute('data-tab'));
        };
    });
});

/**
 * GLOBAL MODAL FUNCTIONS
 * Placed outside of DOMContentLoaded so the HTML buttons can see them.
 */
window.openEmpDoc = function(name, file, url) {
    const modal = document.getElementById('documentModal');
    const wrapper = document.getElementById('modalPreviewWrapper');
    const docTitle = document.getElementById('modalDocName');
    
    if (!modal || !wrapper) {
        console.error("Modal elements missing in HTML");
        return;
    }

    docTitle.innerText = name;
    modal.style.display = 'flex';
    wrapper.innerHTML = "";

    if (file.toLowerCase().endsWith('.pdf')) {
        wrapper.innerHTML = `<iframe src="${url}" width="100%" height="500px" style="border:none;"></iframe>`;
    } else {
        wrapper.innerHTML = `<img src="${url}" style="max-width:100%; max-height:80vh; object-fit:contain; display:block; margin:auto;">`;
    }
};

window.closeModal = function() {
    const modal = document.getElementById('documentModal');
    if (modal) modal.style.display = 'none';
};