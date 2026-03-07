document.addEventListener('DOMContentLoaded', () => {
    // === Sidebar Toggle Logic (Partner's JS Hook) ===
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const logoToggle = document.getElementById('logoToggle');

    const handleToggle = () => { 
        if (sidebar) sidebar.classList.toggle('close'); 
    };

    if (closeBtn) closeBtn.addEventListener('click', handleToggle);
    if (logoToggle) logoToggle.addEventListener('click', handleToggle);
});

/**
 * Saves new employee data to localStorage
 */
function saveEmployee() {
    // Get Field Values
    const fName = document.getElementById('firstName').value.trim();
    const lName = document.getElementById('lastName').value.trim();
    const id = document.getElementById('empID').value.trim();
    const status = document.getElementById('empStatus').value;
    const empType = document.getElementById('empType').value.trim();
    const dateHired = document.getElementById('dateHired').value;
    const department = document.getElementById('dept').value.trim();
    const position = document.getElementById('pos').value.trim();
    
    const email = document.getElementById('email').value.trim();
    const contact = document.getElementById('contact').value.trim();
    const address = document.getElementById('address').value.trim();

    // 1. Validate Required Fields
    if (!fName || !lName || !id || !department || !position) {
        alert("Please fill in all required fields (Names, ID, Department, and Position)");
        return;
    }

    // 2. Create Employee Object
    const newEmployee = {
        id: id,
        fullName: `${lName}, ${fName}`,
        dept: department,
        pos: position,
        status: status,
        empType: empType || "N/A",
        dateHired: dateHired || "N/A",
        email: email || "N/A",
        contact: contact || "N/A",
        address: address || "N/A"
    };

    // 3. Save to LocalStorage
    try {
        let employees = JSON.parse(localStorage.getItem('addedEmployees')) || [];
        
        // Prevent Duplicate IDs
        if (employees.some(emp => emp.id === id)) {
            alert("Error: An employee with this ID already exists.");
            return;
        }

        employees.push(newEmployee);
        localStorage.setItem('addedEmployees', JSON.stringify(employees));
        
        // 4. Success Feedback & Redirect
        alert("Employee successfully added to the records!");
        window.location.href = 'hr_employeelist.html';
        
    } catch (error) {
        console.error("Storage Error:", error);
        alert("An error occurred while saving. Please check browser storage permissions.");
    }
}