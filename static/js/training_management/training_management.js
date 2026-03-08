document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const modal = document.getElementById('trainingModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const addForm = document.getElementById('addTrainingForm');
    const tableBody = document.querySelector('#trainingTable tbody');

    // Sidebar Toggle
    closeBtn.addEventListener("click", () => sidebar.classList.add("collapsed"));
    logoToggle.addEventListener("click", () => {
        if (sidebar.classList.contains("collapsed")) sidebar.classList.remove("collapsed");
    });

    // Modal Control
    openModalBtn.addEventListener('click', () => modal.style.display = 'flex');
    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    // Add Training Work Logic
    addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('newTrainingName').value;
        const category = document.getElementById('newCategory').value;
        const date = document.getElementById('newDate').value;
        const mode = document.getElementById('newMode').value;

        const newRow = `
            <tr>
                <td>00${tableBody.children.length + 1}</td>
                <td>${name}</td>
                <td>${category}</td>
                <td>${date}</td>
                <td>${mode}</td>
                <td>0 / 30</td>
                <td><span class="status open">Open</span></td>
                <td class="actions">
                    <a href="#" class="view-link">View</a>
                    <a href="#" class="edit-link">Edit</a>
                    <a href="#" class="close-link">Close</a>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', newRow);
        addForm.reset();
        modal.style.display = 'none';
    });
});