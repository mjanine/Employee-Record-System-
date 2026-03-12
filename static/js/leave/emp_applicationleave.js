document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const logoToggle = document.getElementById('logoToggle');
    const typeButtons = document.querySelectorAll('.type-btn');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    // Sidebar Toggle
    closeBtn.addEventListener('click', () => sidebar.classList.add('collapsed'));
    logoToggle.addEventListener('click', () => {
        if (sidebar.classList.contains('collapsed')) sidebar.classList.remove('collapsed');
    });

    // Tooltip data
    document.querySelectorAll('.menu-item').forEach(item => {
        const span = item.querySelector('span');
        if (span) item.setAttribute('data-text', span.innerText);
    });

    // Leave Type selection
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            typeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // File Drag & Drop
    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                const fileName = fileInput.files[0].name;
                dropZone.innerHTML = `<i class="fas fa-check-circle" style="color: #28a745; font-size: 24px;"></i>
                                      <p>Selected: <b>${fileName}</b></p>`;
            }
        });
    }
});