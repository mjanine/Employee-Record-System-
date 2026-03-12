document.addEventListener("DOMContentLoaded", () => {
    // --- 1. DOM ELEMENTS ---
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const menuItems = document.querySelectorAll(".menu-item");
    
    // Modal Elements
    const modal = document.getElementById("employeeModal");
    const closeSpan = document.querySelector(".close-modal");
    const tableRows = document.querySelectorAll(".attendance-table tbody tr");
    const weeklyBtn = document.getElementById("weeklyViewBtn");
    const monthlyBtn = document.getElementById("monthlyViewBtn");

    // --- 2. SIDEBAR LOGIC ---
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            sidebar.classList.add("collapsed");
        });
    }

    if (logoToggle) {
        logoToggle.addEventListener("click", () => {
            if (sidebar.classList.contains("collapsed")) {
                sidebar.classList.remove("collapsed");
            }
        });
    }

    // Handle Active States and Tooltips
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) {
            item.setAttribute("data-text", span.innerText.trim());
        }

        item.addEventListener("click", function() {
            const currentActive = document.querySelector(".menu-item.active");
            if (currentActive) {
                currentActive.classList.remove("active");
            }
            this.classList.add("active");
        });
    });

    // --- 3. ATTENDANCE MODAL LOGIC ---

    // Open Modal when a row is clicked
    tableRows.forEach(row => {
        row.style.cursor = "pointer";
        row.addEventListener("click", () => {
            // Extract data from the row
            const name = row.querySelector(".name").innerText;
            const position = row.querySelector(".title").innerText;
            const dept = row.querySelector(".dept-badge").innerText;
            
            // Map data to Modal Details
            document.getElementById("modalEmployeeName").innerText = name;
            document.getElementById("detPos").innerText = position;
            document.getElementById("detDept").innerText = dept;
            
            // Set Default View
            switchAttendanceView('weekly');

            // Open with FLEX to enable the CSS centering
            modal.style.display = "flex";
        });
    });

    // Close Modal Logic
    if (closeSpan) {
        closeSpan.onclick = () => {
            modal.style.display = "none";
        };
    }

    // Close when clicking outside the modal content
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    // Toggle View Listeners
    if (weeklyBtn && monthlyBtn) {
        weeklyBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            switchAttendanceView('weekly');
        });
        monthlyBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            switchAttendanceView('monthly');
        });
    }

    /**
     * Handles switching UI between Weekly and Monthly states
     * @param {string} type - 'weekly' or 'monthly'
     */
    function switchAttendanceView(type) {
        const rangeText = document.getElementById("dateRangeText");
        const periodText = document.getElementById("periodText");
        const totalValue = document.getElementById("totalHoursValue");

        if (type === 'weekly') {
            weeklyBtn.classList.add("active");
            monthlyBtn.classList.remove("active");
            rangeText.innerText = "February 4 - 10, 2026"; 
            periodText.innerText = "Week";
            totalValue.innerText = "42h 15m";
            renderModalTableRows(7); 
        } else {
            monthlyBtn.classList.add("active");
            weeklyBtn.classList.remove("active");
            rangeText.innerText = "February 2026";
            periodText.innerText = "Month";
            totalValue.innerText = "168h 30m";
            renderModalTableRows(28); // Full month view
        }
    }

    /**
     * Populates the modal table with sample rows
     * @param {number} rowCount 
     */
    function renderModalTableRows(rowCount) {
        const tbody = document.getElementById("modalTableBody");
        if (!tbody) return;

        tbody.innerHTML = ""; 
        for (let i = 1; i <= rowCount; i++) {
            const dayNum = i; 
            tbody.innerHTML += `
                <tr>
                    <td>February ${dayNum}, 2026</td>
                    <td>${getDayName(dayNum)}</td>
                    <td>8:00 AM</td>
                    <td>5:00 PM</td>
                    <td>9h 00m</td>
                    <td><span class="pill pill-green">Present</span></td>
                </tr>
            `;
        }
    }

    function getDayName(day) {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        // February 1, 2026 is a Sunday (index 0)
        return days[(day - 1) % 7]; 
    }

    // --- 4. FILTER TAG DISMISSAL ---
    const filterTag = document.querySelector(".filter-tag");
    if (filterTag) {
        const closeIcon = filterTag.querySelector(".fa-times");
        if (closeIcon) {
            closeIcon.addEventListener("click", (e) => {
                e.stopPropagation();
                filterTag.style.display = "none";
            });
        }
    }

    // --- 5. RESPONSIVE BEHAVIOR ---
    const handleResize = () => {
        if (window.innerWidth <= 1100) {
            sidebar.classList.add("collapsed");
        } else {
            sidebar.classList.remove("collapsed");
        }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
});