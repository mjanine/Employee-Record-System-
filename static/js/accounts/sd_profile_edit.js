document.addEventListener('DOMContentLoaded', function() {
    const targetID = "003"; // Targeting School Director ID

    // --- Sidebar & UI Logic ---
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const logoToggle = document.getElementById('logoToggle');

    const handleToggle = () => sidebar && sidebar.classList.toggle('close');
    if (closeBtn) closeBtn.onclick = handleToggle;
    if (logoToggle) logoToggle.onclick = handleToggle;

    // Sidebar Tooltips
    document.querySelectorAll('.menu-item').forEach(item => {
        const span = item.querySelector('span');
        if (span) item.setAttribute('data-text', span.innerText);
    });

    // --- Data Loading Logic ---
    let employees = JSON.parse(localStorage.getItem('addedEmployees')) || [];
    let headData = employees.find(e => e.id === targetID);

    if (headData) {
        // Map data to your exact HTML IDs
        document.getElementById('sdID').value = headData.id || "";
        document.getElementById('sdStatus').value = headData.status || "";
        document.getElementById('sdType').value = headData.empType || ""; // maps to Employment Type
        document.getElementById('dept').value = headData.dept || "";
        document.getElementById('pos').value = headData.pos || "";
        document.getElementById('dateHired').value = headData.dateHired || "";
        
        // Split Name logic
        if (headData.fullName && headData.fullName.includes(',')) {
            const parts = headData.fullName.split(',');
            document.getElementById('lastName').value = parts[0].trim();
            document.getElementById('firstName').value = parts[1].trim();
        } else {
            document.getElementById('firstName').value = headData.fullName || "";
            document.getElementById('lastName').value = "---";
        }

        // Photo
        if (headData.photo) {
            document.getElementById('displayPhoto').src = headData.photo;
        }

        // Editable Contact Fields
        document.getElementById('email').value = headData.email || "";
        document.getElementById('contact').value = headData.contact || "";
        document.getElementById('address').value = headData.address || "";
        document.getElementById('emergencyName').value = headData.emergencyName || "";
        document.getElementById('emergencyPhone').value = headData.emergencyPhone || "";
    } else {
        console.error("No record found for ID 003");
    }
});

// --- Update Function ---
window.updateSD = function() {
    const targetID = "003";
    let employees = JSON.parse(localStorage.getItem('addedEmployees')) || [];
    const index = employees.findIndex(e => e.id === targetID);

    if (index !== -1) {
        // Update the editable fields only
        employees[index].email = document.getElementById('email').value;
        employees[index].contact = document.getElementById('contact').value;
        employees[index].address = document.getElementById('address').value;
        employees[index].emergencyName = document.getElementById('emergencyName').value;
        employees[index].emergencyPhone = document.getElementById('emergencyPhone').value;

        // Save to storage
        localStorage.setItem('addedEmployees', JSON.stringify(employees));
        
        alert("Changes saved successfully!");
        window.location.href = "sd_profile_view.html";
    } else {
        alert("Error: Record not found.");
    }
};