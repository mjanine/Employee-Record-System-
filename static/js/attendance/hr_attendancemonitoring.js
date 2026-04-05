document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const modal = document.getElementById("employeeModal");
    const closeSpan = document.querySelector(".close-modal");
    const tableRows = document.querySelectorAll(".attendance-table tbody tr");

    // Sidebar Toggle Logic
    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add("collapsed");
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle("collapsed");

    // Modal Logic
    tableRows.forEach(row => {
        row.onclick = () => {
            const name = row.querySelector(".name").innerText;
            document.getElementById("modalEmployeeName").innerText = name;
            modal.style.display = "block";
        };
    });

    if (closeSpan) closeSpan.onclick = () => modal.style.display = "none";
    
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = "none";
    };
});