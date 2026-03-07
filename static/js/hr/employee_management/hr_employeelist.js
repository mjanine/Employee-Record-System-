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