document.addEventListener('DOMContentLoaded', function() {
    const targetID = "002"; // Strictly targets the Department Head ID

    // 1. SIDEBAR TOGGLE LOGIC
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const logoToggle = document.getElementById('logoToggle');
    
    const handleToggle = () => sidebar.classList.toggle('close');
    if (closeBtn) closeBtn.onclick = handleToggle;
    if (logoToggle) logoToggle.onclick = handleToggle;

    // Set tooltip text for closed sidebar
    document.querySelectorAll('.menu-item').forEach(item => {
        const span = item.querySelector('span');
        if (span) {
            item.setAttribute('data-text', span.innerText);
        }
    });

    // 2. DATA RETRIEVAL (Shared with HR)
    function getEmployeeData() {
        const employees = JSON.parse(localStorage.getItem('addedEmployees')) || [];
        return employees.find(e => e.id === targetID);
    }

    // 3. HEADER SYNC (Profile Card)
    function syncHeader() {
        const data = getEmployeeData();
        if (!data) return;

        if (data.photo) document.getElementById('profImage').src = data.photo;
        document.getElementById('profName').innerText = data.fullName;
        document.getElementById('profRoleHeader').innerText = data.pos;
        document.getElementById('profID').innerText = "Head ID: " + data.id;
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
        if (dot) {
            if (s === "active") dot.style.backgroundColor = "#28a745";
            else if (s === "on leave") dot.style.backgroundColor = "#f3e08c";
            else dot.style.backgroundColor = "#dc3545";
        }
    }

    // 4. DYNAMIC TAB RENDERING
    function renderTab(tabName) {
        const data = getEmployeeData();
        const container = document.getElementById('tab-content-container');
        if (!data) return;

        // --- DEPARTMENT VIEW ---
        if (tabName === 'head_department_view') {
            const codeMap = { "Registrar": "REG - 101", "Computer": "CCS - 201", "Engineering": "COE - 301", "Medicine": "MED - 401", "Arts": "CAS - 501", "Business": "CBA - 601" };
            let deptCode = "GEN - 101";
            for(let key in codeMap) { if(data.dept.includes(key)) deptCode = codeMap[key]; }

            let officeLoc = "Main Campus Area";
            if(data.dept.includes("Registrar")) officeLoc = "Ground Floor, Admin Building";
            else if(data.dept.includes("Computer")) officeLoc = "Main building 2nd floor";
            else if(data.dept.includes("Engineering")) officeLoc = "4th Floor, East Building";

            container.innerHTML = `
                <div style="background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #e2e2e2; color: #000;">
                    <h4 style="background-color: #ECECEC; padding: 12px 20px; margin: -20px -20px 15px -20px; border-radius: 12px 12px 0 0; font-weight: 600;">Department Information</h4>
                    <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
                        <span>Department / Office</span> <span style="font-weight:600;">${data.dept}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
                        <span>Department Code</span> <span style="font-weight:600;">${deptCode}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
                        <span>Office Location</span> <span style="font-weight:600;">${officeLoc}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                        <span>Contact email</span> <span style="font-weight:600;">${data.dept.toLowerCase().split(' ')[0]}.head@uphsl.edu.ph</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                        <span>Contact Number</span> <span style="font-weight:600;">+63 912 345 6789</span>
                    </div>
                </div>`;
        } 
        
        // --- DOCUMENTS VIEW (Strict Missing Action Logic) ---
        else if (tabName === 'head_documents_view') {
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
                    <td style="padding:15px 10px; color:#999;">${fileExt}</td>
                    <td style="padding:15px 10px;">
                        <span style="display:inline-block; width:8px; height:8px; background:${dotColor}; border-radius:50%; margin-right:5px;"></span>${info.status}
                    </td>
                    <td style="padding:15px 10px; color:#999;">${info.date}</td>
                    <td style="padding:15px 10px;">
                        ${info.url 
                            ? `<button onclick="window.openEmpDoc('${name}', '${info.file}', '${info.url}')" style="color:#7b3f3f; background:none; border:none; cursor:pointer; font-weight:bold;">View</button>` 
                            : `<span style="color:#999; font-style:italic;">No Action Required</span>`
                        }
                    </td>
                </tr>`;
            }).join('');

            container.innerHTML = `
                <div style="background: #fff; border-radius: 12px; border: 1px solid #e2e2e2; color: #000; overflow: hidden;">
                    <div style="background-color: #ECECEC; padding: 12px 20px; color: #777; font-size: 13px;">
                        ${uploadedCount} of ${requiredDocs.length} required documents uploaded
                    </div>
                    <div style="padding: 20px;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead style="text-align:left; color:#888; font-size:12px; border-bottom: 1px solid #eee;">
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

        // --- EMPLOYMENT HISTORY VIEW ---
        else if (tabName === 'head_employment-history_view') {
            const history = data.history || [];
            
            let timelineItems = history.length > 0 ? history.map(item => `
                <div class="timeline-item" style="display: flex; margin-bottom: 30px; position: relative; color: #000;">
                    <div style="width: 100px; text-align: right; padding-right: 20px; font-size: 12px; color: #999;">${item.date}</div>
                    <div style="width: 2px; background: #eee; position: relative;">
                        <span style="position: absolute; left: -5px; top: 0; width: 12px; height: 12px; background: ${item.color === 'yellow' ? '#f3e08c' : '#9abed7'}; border-radius: 50%; border: 2px solid #fff;"></span>
                    </div>
                    <div style="flex: 1; padding-left: 20px;">
                        <div style="font-weight: bold; margin-bottom: 5px;">${item.type}</div>
                        <div style="font-size: 13px; color: #555;">From: ${item.from} | To: ${item.to}</div>
                    </div>
                </div>`).join('') : `<p style="padding:20px; color:#999;">No history recorded.</p>`;

            container.innerHTML = `
                <div style="background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #e2e2e2; color: #000;">
                    <h4 style="background-color: #ECECEC; padding: 12px 20px; margin: -20px -20px 25px -20px; border-radius: 12px 12px 0 0; font-weight: 600; margin-bottom: 25px;">Employment History</h4>
                    <div style="padding: 10px 20px;">${timelineItems}</div>
                </div>`;
        }
    }

    // 5. INITIALIZATION
    syncHeader();
    renderTab('head_department_view');

    // 6. TAB CLICK EVENT LISTENERS
    document.querySelectorAll('.tab').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            renderTab(btn.getAttribute('data-tab'));
        };
    });
});

// 7. MODAL HELPERS
window.openEmpDoc = function(name, file, url) {
    const modal = document.getElementById('documentModal');
    const wrapper = document.getElementById('modalPreviewWrapper');
    const docTitle = document.getElementById('modalDocName');
    
    if (!modal || !wrapper) return;

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