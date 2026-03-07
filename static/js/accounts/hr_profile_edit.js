let uploadedPhotoData = null;

function getReturnURL() {
    const params = new URLSearchParams(window.location.search);
    const source = params.get('source');
    const id = params.get('id');
    
    // If the source was 'profile', go back to the profile view, else the list
    if (source === 'profile') {
        return `hr_profile_view.html?id=${id}`;
    } else {
        return `../hr/employee_management/hr_employeelist.html`;
    }
}

window.handleCancel = function() {
    window.location.href = getReturnURL();
};

window.handlePhotoUpload = function(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedPhotoData = e.target.result;
            const photoCircle = document.querySelector('.photo-circle');
            if (photoCircle) {
                photoCircle.innerHTML = `<img src="${uploadedPhotoData}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            }
        };
        reader.readAsDataURL(file);
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const idToEdit = params.get('id');
    let employees = JSON.parse(localStorage.getItem('addedEmployees')) || [];

    let empData = employees.find(e => e.id === idToEdit);
    
    // Fallback if record is missing but ID is known
    if (!empData && idToEdit === "2024-001") {
        empData = { id: "2024-001", fullName: "HR, Admin", dept: "HR Department", pos: "Administrator", status: "Active" };
    }

    if (empData) {
        if (empData.fullName && empData.fullName.includes(',')) {
            const parts = empData.fullName.split(',');
            document.getElementById('lastName').value = parts[0].trim();
            document.getElementById('firstName').value = parts[1].trim();
        } else {
            document.getElementById('firstName').value = empData.fullName || "";
        }
        
        document.getElementById('empID').value = empData.id || "";
        document.getElementById('empStatus').value = empData.status || "Active";
        document.getElementById('empType').value = empData.empType || "";
        document.getElementById('dept').value = empData.dept || "";
        document.getElementById('pos').value = empData.pos || "";
        document.getElementById('dateHired').value = empData.dateHired || "";
        document.getElementById('email').value = empData.email || "";
        document.getElementById('contact').value = empData.contact || "";
        document.getElementById('address').value = empData.address || "";
        document.getElementById('emergencyName').value = empData.emergencyName || "";
        document.getElementById('emergencyPhone').value = empData.emergencyPhone || "";

        if (empData.photo) {
            const photoCircle = document.querySelector('.photo-circle');
            if (photoCircle) {
                photoCircle.innerHTML = `<img src="${empData.photo}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            }
        }
    }
});

window.updateEmployee = function() {
    const params = new URLSearchParams(window.location.search);
    const idToEdit = params.get('id');
    let employees = JSON.parse(localStorage.getItem('addedEmployees')) || [];

    const existingEmp = employees.find(e => e.id === idToEdit);

    const updatedData = {
        id: document.getElementById('empID').value,
        fullName: document.getElementById('lastName').value + ", " + document.getElementById('firstName').value,
        dept: document.getElementById('dept').value,
        pos: document.getElementById('pos').value,
        status: document.getElementById('empStatus').value,
        empType: document.getElementById('empType').value,
        dateHired: document.getElementById('dateHired').value,
        email: document.getElementById('email').value,
        contact: document.getElementById('contact').value,
        address: document.getElementById('address').value,
        emergencyName: document.getElementById('emergencyName').value,
        emergencyPhone: document.getElementById('emergencyPhone').value,
        photo: uploadedPhotoData || (existingEmp ? existingEmp.photo : null)
    };

    const index = employees.findIndex(e => e.id === idToEdit);

    if (index !== -1) {
        employees[index] = updatedData;
    } else {
        employees.push(updatedData);
    }

    localStorage.setItem('addedEmployees', JSON.stringify(employees));
    alert("Record updated successfully!");
    window.location.href = getReturnURL();
};

document.getElementById('deleteBtn').onclick = function() {
    const params = new URLSearchParams(window.location.search);
    const idToEdit = params.get('id');
    
    if(confirm("Are you sure you want to delete this record?")) {
        let employees = JSON.parse(localStorage.getItem('addedEmployees')) || [];
        employees = employees.filter(e => e.id !== idToEdit);
        localStorage.setItem('addedEmployees', JSON.stringify(employees));
        window.location.href = `../hr/employee_management/hr_employeelist.html`;
    }
};