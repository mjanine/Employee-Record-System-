document.addEventListener('DOMContentLoaded', function() {
    const targetID = "001"; 
    
    // Sidebar Logic
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const logoToggle = document.getElementById('logoToggle');

    const handleToggle = () => sidebar.classList.toggle('close');
    if (closeBtn) closeBtn.onclick = handleToggle;
    if (logoToggle) logoToggle.onclick = handleToggle;

    // Load Data
    let employees = JSON.parse(localStorage.getItem('addedEmployees')) || [];
    let empData = employees.find(e => e.id === targetID);

    if (empData) {
        // Read Only Fields
        document.getElementById('empID').value = empData.id || "";
        document.getElementById('empStatus').value = empData.status || "Active";
        document.getElementById('empType').value = empData.empType || "Full-time";
        document.getElementById('dept').value = empData.dept || "";
        document.getElementById('pos').value = empData.pos || "";
        document.getElementById('dateHired').value = empData.dateHired || "";
        
        if (empData.fullName && empData.fullName.includes(',')) {
            const parts = empData.fullName.split(',');
            document.getElementById('lastName').value = parts[0].trim();
            document.getElementById('firstName').value = parts[1].trim();
        } else {
            document.getElementById('firstName').value = empData.fullName || "";
            document.getElementById('lastName').value = "---";
        }

        if (empData.photo) document.getElementById('displayPhoto').src = empData.photo;

        // Editable Fields
        document.getElementById('email').value = empData.email || "";
        document.getElementById('contact').value = empData.contact || "";
        document.getElementById('address').value = empData.address || "";
        document.getElementById('emergencyName').value = empData.emergencyName || "";
        document.getElementById('emergencyPhone').value = empData.emergencyPhone || "";
    }
});

window.updateEmployee = function() {
    const targetID = "001";
    let employees = JSON.parse(localStorage.getItem('addedEmployees')) || [];
    const index = employees.findIndex(e => e.id === targetID);

    if (index !== -1) {
        employees[index].email = document.getElementById('email').value;
        employees[index].contact = document.getElementById('contact').value;
        employees[index].address = document.getElementById('address').value;
        employees[index].emergencyName = document.getElementById('emergencyName').value;
        employees[index].emergencyPhone = document.getElementById('emergencyPhone').value;

        localStorage.setItem('addedEmployees', JSON.stringify(employees));
        alert("Success! Changes saved.");
        window.location.href = "emp_profile_view.html";
    }
};

document.querySelectorAll('.menu-item').forEach(item => {
    const span = item.querySelector('span');
    if (span) {
        item.setAttribute('data-text', span.innerText);
    }
});