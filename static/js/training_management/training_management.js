document.addEventListener('DOMContentLoaded', () => {
    // --- Sidebar Elements ---
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");

    // --- Search & Table Elements ---
    const searchInput = document.getElementById('searchInput');
    const tableRows = () => document.querySelectorAll('#trainingTable tbody tr');

    // --- Modal Elements ---
    const modal = document.getElementById('trainingModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const addForm = document.getElementById('addTrainingForm');

    /* --- Sidebar Logic --- */
    closeBtn.addEventListener('click', () => {
        sidebar.classList.add("collapsed");
    });

    logoToggle.addEventListener('click', () => {
        if (sidebar.classList.contains("collapsed")) {
            sidebar.classList.remove("collapsed");
        }
    });

    /* --- Search Logic --- */
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        
        tableRows().forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    });

    /* --- Modal Logic --- */
    openModalBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close on outside click
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    /* --- Form Submission Logic (Dummy) --- */
    addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // This is where you would normally send data to a server
        const name = document.getElementById('newTrainingName').value;
        alert(`New Training "${name}" added to system!`);
        
        addForm.reset();
        modal.style.display = 'none';
    });
});