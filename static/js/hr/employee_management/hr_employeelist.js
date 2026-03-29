document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const filterPosition = document.getElementById('filterPosition');
    const filterStatus = document.getElementById('filterStatus');
    const tableBody = document.getElementById('employeeTableBody');

    function filterTable() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedPosition = filterPosition.value;
        const selectedStatus = filterStatus.value;

        // Loop through all table rows in the body
        Array.from(tableBody.rows).forEach(row => {
            const cells = row.cells;
            
            // Text content from specific columns
            const rowText = row.textContent.toLowerCase();
            const rowPosition = cells[3].textContent.trim();
            const rowStatus = cells[4].textContent.trim();

            // Check conditions
            const matchesSearch = rowText.includes(searchTerm);
            const matchesPosition = selectedPosition === "" || rowPosition === selectedPosition;
            const matchesStatus = selectedStatus === "" || rowStatus === selectedStatus;

            // Show or hide row
            if (matchesSearch && matchesPosition && matchesStatus) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    }

    // Event Listeners
    searchInput.addEventListener('input', filterTable);
    filterPosition.addEventListener('change', filterTable);
    filterStatus.addEventListener('change', filterTable);
});