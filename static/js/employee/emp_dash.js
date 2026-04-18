/* =================================
   Employee Dashboard JavaScript
   ================================= */

// Initialize Dashboard on DOM Load
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
});

function initializeDashboard() {
    // Initialize charts
    initializeAttendanceChart();
    
    // Load dynamic data hooks
    loadDashboardData();
}

/* =================================
   SIDEBAR FUNCTIONALITY
   ================================= */

function setupEventListeners() {
    const sidebar = document.getElementById('sidebar');
    const logoToggle = document.getElementById('logoToggle');
    const closeBtn = document.getElementById('closeBtn');
    const menuItems = document.querySelectorAll('.menu-item');
    
    // Close button (only when expanded)
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.add('collapsed');
        });
    }
    
    // Open via logo click
    if (logoToggle) {
        logoToggle.addEventListener('click', () => {
            if (sidebar.classList.contains('collapsed')) {
                sidebar.classList.remove('collapsed');
            }
        });
    }
    
    // Set menu item attributes for tooltips
    menuItems.forEach(item => {
        const text = item.querySelector('span');
        if (text) {
            item.setAttribute('data-text', text.innerText);
        }
        
        item.addEventListener('click', () => {
            document.querySelector('.menu-item.active')?.classList.remove('active');
            item.classList.add('active');
        });
    });

    setupComingSoonLinks();
    
    // Evaluation card click
    setupEvaluationCard();
    
    // Notification clear button
    setupNotificationPanel();
}

/* =================================
   EVALUATION CARD
   ================================= */

function setupEvaluationCard() {
    const evaluationCard = document.getElementById('evaluationCard');
    
    if (evaluationCard) {
        evaluationCard.addEventListener('click', (e) => {
            e.preventDefault();
            // Navigate to evaluation page
            window.location.href = evaluationCard.getAttribute('href');
        });
    }
}

/* =================================
   NOTIFICATION PANEL
   ================================= */

function setupNotificationPanel() {
    const clearBtn = document.querySelector('.notification-clear');
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            clearAllNotifications();
        });
    }
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i += 1) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === `${name}=`) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function clearAllNotifications() {
    const notificationsList = document.querySelector('.notifications-list');
    const clearBtn = document.querySelector('.notification-clear');
    const markAllUrl = clearBtn?.dataset.markAllUrl;

    if (markAllUrl) {
        try {
            const response = await fetch(markAllUrl, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error(`Failed with status ${response.status}`);
            }
        } catch (error) {
            console.error('Unable to clear notifications on server.', error);
            window.alert('Unable to clear notifications right now. Please try again.');
            return;
        }
    }

    if (notificationsList) {
        notificationsList.innerHTML = '';
        const emptyMessage = document.createElement('div');
        emptyMessage.style.cssText = 'padding: 2rem 1.5rem; text-align: center; color: var(--hr-text-light); font-size: 0.9rem;';
        emptyMessage.innerText = 'No notifications';
        notificationsList.appendChild(emptyMessage);
    }

    const pendingEl = document.querySelector('.notification-time');
    if (pendingEl && pendingEl.textContent.includes('Pending:')) {
        pendingEl.textContent = 'Pending: 0';
    }
}

/* =================================
   ATTENDANCE CHART (EMPLOYEE-SPECIFIC)
   ================================= */

function initializeAttendanceChart() {
    const ctx = document.getElementById('attendanceChart');
    if (!ctx) return;

    const payloadElement = document.getElementById('employeeAttendanceSummary');
    let summary = { present: 0, late: 0, undertime: 0, absent: 0 };
    if (payloadElement) {
        try {
            summary = JSON.parse(payloadElement.textContent || '{}');
        } catch (error) {
            console.warn('Invalid employee attendance summary payload', error);
        }
    }

    const data = {
        labels: ['Present', 'Late', 'Undertime', 'Absent'],
        datasets: [
            {
                label: 'Days',
                data: [summary.present || 0, summary.late || 0, summary.undertime || 0, summary.absent || 0],
                backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'],
                borderColor: '#ffffff',
                borderWidth: 2,
            }
        ]
    };
    
    new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: { size: 12, weight: '500' },
                        color: '#1e293b'
                    }
                }
            }
        }
    });
}

/* =================================
   DASHBOARD DATA
   ================================= */

function loadDashboardData() {
    // Reserved for future dynamic dashboard widgets.
}

function setupComingSoonLinks() {
    const comingSoonLinks = document.querySelectorAll('.coming-soon-link');
    comingSoonLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const featureName = link.dataset.feature || 'This feature';
            window.alert(`${featureName} is coming soon.`);
        });
    });
}