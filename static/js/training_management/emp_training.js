document.addEventListener("DOMContentLoaded", () => {
    // --- UI Elements ---
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const mainContent = document.getElementById("mainContent");
    
    const modal = document.getElementById("trainingModal");
    const closeModal = document.getElementById("closeModal");
    const searchInput = document.getElementById("trainingSearch");
    const trainingCards = document.querySelectorAll(".training-card");

    // --- Sidebar Toggle Logic ---
    closeBtn.addEventListener("click", () => {
        sidebar.classList.add("collapsed");
        if (mainContent) mainContent.style.marginLeft = "100px";
    });

    logoToggle.addEventListener("click", () => {
        if (sidebar.classList.contains("collapsed")) {
            sidebar.classList.remove("collapsed");
            if (mainContent) mainContent.style.marginLeft = "340px";
        }
    });

    // --- Search / Filter Logic ---
    if (searchInput) {
        searchInput.addEventListener("keyup", () => {
            const filter = searchInput.value.toLowerCase();
            trainingCards.forEach(card => {
                const text = card.innerText.toLowerCase();
                card.style.display = text.includes(filter) ? "flex" : "none";
            });
        });
    }

    // --- Training Card & Modal Logic ---
    trainingCards.forEach(card => {
        card.addEventListener("click", (e) => {
            
            // 1. Check if the user clicked the "Register" button specifically
            if (e.target.classList.contains('btn-register')) {
                const trainingName = card.querySelector(".training-card-title").innerText;
                handleRegistration(trainingName);
                return; // Prevent the modal from opening
            }

            // 2. Otherwise, Open the Modal and populate data
            openTrainingModal(card);
        });
    });

    // Function to populate and show modal
    function openTrainingModal(card) {
        // Extract data from the card elements
        const title = card.querySelector(".training-card-title").innerText;
        const category = card.querySelector(".training-card-category").innerText;
        const dateStr = card.querySelector(".training-card-date").innerText;
        const modeTag = card.querySelector(".tag-mode").innerText;

        // Extract detailed info from data-attributes
        const description = card.getAttribute('data-description');
        const trainer = card.getAttribute('data-trainer');
        const location = card.getAttribute('data-location');
        const email = card.getAttribute('data-email');
        const phone = card.getAttribute('data-phone');

        // Update Modal Fields
        document.getElementById("modalTitle").innerText = title;
        // Clean up the date to show only the date part in the subtext
        const cleanDate = dateStr.split(' • ')[0];
        document.getElementById("modalSubtext").innerText = `${category} | ${modeTag} | ${cleanDate}`;
        
        document.getElementById("modalDesc").innerText = description || "N/A";
        document.getElementById("modalTrainer").innerText = trainer || "N/A";
        document.getElementById("modalLocation").innerText = location || "N/A";
        document.getElementById("modalEmail").innerText = email || "N/A";
        document.getElementById("modalPhone").innerText = phone || "N/A";

        // Show Modal
        modal.classList.add("active");
    }

    // Placeholder for Registration Logic
    function handleRegistration(name) {
        // You can replace this with an AJAX call to your backend later
        alert(`Registration Request Sent for: ${name}`);
    }

    // --- Close Modal Helpers ---
    const hideModal = () => modal.classList.remove("active");

    if (closeModal) {
        closeModal.addEventListener("click", hideModal);
    }

    // Close when clicking the background overlay
    window.addEventListener("click", (e) => {
        if (e.target === modal) hideModal();
    });

    // Close on 'Escape' key for better UX
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("active")) {
            hideModal();
        }
    });
});