/**
 * EMPLOYEE MANAGEMENT SYSTEM - ADD EMPLOYEE LOGIC
 */

function saveEmployee() {
    // 1. Get field values
    const fName = document.getElementById('firstName').value.trim();
    const lName = document.getElementById('lastName').value.trim();
    const id = document.getElementById('empID').value.trim();
    const status = document.getElementById('empStatus').value;
    const type = document.getElementById('empType').value.trim();
    const department = document.getElementById('dept').value.trim();
    const position = document.getElementById('pos').value.trim();
    const dateHired = document.getElementById('dateHired').value;
    
    const email = document.getElementById('email').value.trim();
    const contact = document.getElementById('contact').value.trim();
    const address = document.getElementById('address').value.trim();

    // 2. Validate required fields
    if (!fName || !lName || !id || !department || !position) {
        alert("Please fill in all required fields (Names, ID, Department, and Position)");
        return;
    }

    // 3. Create comprehensive employee object
    const newEmployee = {
        id: id,
        fullName: `${lName}, ${fName}`,
        dept: department,
        pos: position,
        status: status,
        empType: type || "N/A",
        dateHired: dateHired || "N/A",
        email: email || "N/A",
        contact: contact || "N/A",
        address: address || "N/A"
    };

    // 4. Update LocalStorage
    try {
        let employees = JSON.parse(localStorage.getItem('addedEmployees')) || [];
        
        // Check for duplicate ID
        const isDuplicate = employees.some(emp => emp.id === id);
        if (isDuplicate) {
            alert("An employee with this ID already exists.");
            return;
        }

        employees.push(newEmployee);
        localStorage.setItem('addedEmployees', JSON.stringify(employees));
        
        // 5. Success and Redirect
        alert("Employee added successfully!");
        window.location.href = 'hr_employeelist.html';
        
    } catch (error) {
        console.error("Error saving to localStorage:", error);
        alert("Failed to save employee data.");
    }
}