/* =========================================================
   EMPLOYEE LIST LOGIC (list.js)
========================================================= */

document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('employeeTableBody');
    const searchInput = document.getElementById('searchInput');
    const positionSelect = document.getElementById('filterPosition');
    const statusSelect = document.getElementById('filterStatus');

    // Load data from localStorage
    let storedEmployees = JSON.parse(localStorage.getItem('addedEmployees')) || [];

    // Initialize with default data if empty
    if (storedEmployees.length === 0) {
        storedEmployees = [{
            id: "001",
            fullName: "Dela Cruz, Juan",
            dept: "College of Computer Studies (CCS)",
            pos: "Instructor",
            status: "Active"
        }];
        localStorage.setItem('addedEmployees', JSON.stringify(storedEmployees));
    }

    /**
     * Renders the employee table rows based on provided data
     */
    function renderTable(data) {
        tableBody.innerHTML = "";
        data.forEach(emp => {
            const row = document.createElement('tr');
            
            // Format status class for CSS (e.g., "On Leave" becomes "on_leave")
            const statusClass = emp.status ? emp.status.toLowerCase().replace(/\s+/g, '_') : "active";

            row.innerHTML = `
                <td>${emp.id}</td>
                <td>${emp.fullName}</td>
                <td>${emp.dept}</td>
                <td>${emp.pos}</td>
                <td><span class="status ${statusClass}">${emp.status}</span></td>
                <td>
                    <a href="../../accounts/hr_profile_view.html?id=${emp.id}" class="action-link">View</a> | 
                    <a href="../../accounts/hr_profile_edit.html?id=${emp.id}&source=list" class="action-link">Edit</a>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    /**
     * Filters the stored employees based on search input and dropdown selects
     */
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const positionFilter = positionSelect.value.toLowerCase();
        const statusFilter = statusSelect.value.toLowerCase();

        const filtered = storedEmployees.filter(emp => {
            // Check all major fields for the search term
            const matchesSearch = 
                emp.fullName.toLowerCase().includes(searchTerm) || 
                emp.id.toLowerCase().includes(searchTerm) ||
                emp.dept.toLowerCase().includes(searchTerm) ||
                emp.pos.toLowerCase().includes(searchTerm);

            // Check dropdown matches
            const matchesPosition = positionFilter === "" || emp.pos.toLowerCase() === positionFilter;
            const matchesStatus = statusFilter === "" || emp.status.toLowerCase() === statusFilter;
            
            return matchesSearch && matchesPosition && matchesStatus;
        });
        
        renderTable(filtered);
    }

    // Initial Render
    renderTable(storedEmployees);

    // Event Listeners for Real-time Filtering
    searchInput.addEventListener('input', applyFilters);
    positionSelect.addEventListener('change', applyFilters);
    statusSelect.addEventListener('change', applyFilters);
});