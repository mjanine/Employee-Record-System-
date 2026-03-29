const searchInput = document.getElementById('searchInput');
const filterPosition = document.getElementById('filterPosition');
const filterStatus = document.getElementById('filterStatus');
const tableBody = document.getElementById('employeeTableBody');

function filterTable() {
    const search = searchInput.value.toLowerCase();
    const position = filterPosition.value;
    const status = filterStatus.value;

    Array.from(tableBody.rows).forEach(row => {
        const cells = row.cells;
        const matchSearch = Array.from(cells).some(cell => cell.textContent.toLowerCase().includes(search));
        const matchPosition = !position || cells[3].textContent === position;
        const matchStatus = !status || cells[4].textContent === status;

        row.style.display = (matchSearch && matchPosition && matchStatus) ? '' : 'none';
    });
}

searchInput.addEventListener('input', filterTable);
filterPosition.addEventListener('change', filterTable);
filterStatus.addEventListener('change', filterTable);
