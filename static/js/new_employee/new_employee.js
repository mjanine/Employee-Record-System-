/* --- UI Elements Initialization --- */
const sidebar = document.getElementById("sidebar");
const logoToggle = document.getElementById("logoToggle");
const closeBtn = document.getElementById("closeBtn");
const modal = document.getElementById("viewModal");
const closeModal = document.getElementById("modalClose");

/* --- Slide & Table Elements --- */
const nextBtn = document.getElementById("nextSlide");
const prevBtn = document.getElementById("prevSlide");
const slide1 = document.getElementById("slide1");
const slide2 = document.getElementById("slide2");
const docImg = document.querySelector(".doc-image");
const searchInput = document.querySelector('.search-input-wrapper input');
const tableRows = document.querySelectorAll('tbody tr');

/* --- Sidebar Logic --- */

closeBtn.addEventListener("click", () => {
    sidebar.classList.add("collapsed");
});

logoToggle.addEventListener("click", () => {
    if (sidebar.classList.contains("collapsed")) {
        sidebar.classList.remove("collapsed");
    }
});

// Tooltips for collapsed state
document.querySelectorAll(".menu-item").forEach(item => {
    const spanText = item.querySelector("span")?.innerText || "";
    item.setAttribute("data-text", spanText);
});

/* --- Search Functionality --- */

if (searchInput) {
    searchInput.addEventListener('keyup', function() {
        const searchTerm = this.value.toLowerCase().trim();
        let visibleCount = 0;

        tableRows.forEach((row) => {
            // Check ID, Name, Dept, and Position columns
            const id = row.cells[0]?.innerText.toLowerCase() || "";
            const name = row.cells[1]?.innerText.toLowerCase() || "";
            const dept = row.cells[2]?.innerText.toLowerCase() || "";
            const pos = row.cells[3]?.innerText.toLowerCase() || "";

            if (id.includes(searchTerm) || name.includes(searchTerm) || 
                dept.includes(searchTerm) || pos.includes(searchTerm)) {
                
                row.style.display = ""; 
                // Manual zebra striping fix for filtered results
                row.style.backgroundColor = (visibleCount % 2 === 0) ? "#ffffff" : "#f0f0f0";
                visibleCount++;
            } else {
                row.style.display = "none";
            }
        });
    });
}

/* --- Slide Navigation Logic --- */

function showSlide(slideNumber) {
    if (slideNumber === 1) {
        slide1.classList.add("active");
        slide2.classList.remove("active");
    } else {
        slide1.classList.remove("active");
        slide2.classList.add("active");
    }
}

if (nextBtn) nextBtn.addEventListener("click", () => showSlide(2));
if (prevBtn) prevBtn.addEventListener("click", () => showSlide(1));

/* --- Image Handling (Slide 2) --- */

if (docImg) {
    docImg.onerror = function() {
        this.style.display = "none";
        console.warn("Document image failed to load.");
    };

    if (!docImg.getAttribute('src') || docImg.getAttribute('src') === "") {
        docImg.style.display = "none";
    } else {
        docImg.style.display = "block";
    }
}

/* --- Modal Control Logic --- */

document.querySelectorAll(".view-link").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        showSlide(1); 
        modal.style.display = "flex";
    });
});

const closeViewModal = () => {
    modal.style.display = "none";
};

if (closeModal) closeModal.addEventListener("click", closeViewModal);

window.addEventListener("click", (e) => {
    if (e.target === modal) closeViewModal();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") {
        closeViewModal();
    }
});

/* --- Action Buttons --- */

document.querySelector(".modal-approve")?.addEventListener("click", () => {
    if (confirm("Are you sure you want to approve this application?")) {
        alert("Application has been approved.");
        closeViewModal();
    }
});

document.querySelector(".modal-reject")?.addEventListener("click", () => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason !== null && reason.trim() !== "") {
        alert("Application has been rejected.");
        closeViewModal();
    }
});
/* --- Position Change Request Modal Logic --- */

const posModal = document.getElementById("positionChangeModal");
const posBtn = document.getElementById("posRequestBtn");
const posClose = document.getElementById("posClose");
const cancelReq = document.getElementById("cancelRequest");

if (posBtn && posModal) {
    // Open the Log New Request Modal
    posBtn.addEventListener("click", (e) => {
        e.preventDefault();
        posModal.style.display = "flex";
    });

    // Close Modal when 'X' is clicked
    if (posClose) {
        posClose.addEventListener("click", () => {
            posModal.style.display = "none";
        });
    }

    // Close Modal when 'Cancel' button is clicked
    if (cancelReq) {
        cancelReq.addEventListener("click", () => {
            posModal.style.display = "none";
        });
    }
}

// Update the global click listener to handle the new modal
window.addEventListener("click", (e) => {
    if (e.target === modal) closeViewModal(); // Your existing logic
    if (e.target === posModal) posModal.style.display = "none"; // New logic
});