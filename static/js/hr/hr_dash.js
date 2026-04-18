/* =================================
   HR Dashboard JavaScript
   ================================= */

// Initialize Dashboard on DOM Load
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
});

function initializeDashboard() {
    // Initialize charts
    initializeAttendanceChart();
    
    // Load dynamic data
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
    
    // Notification clear button
    setupNotificationPanel();
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
   ATTENDANCE CHART
   ================================= */

function initializeAttendanceChart() {
    const payloadElement = document.getElementById('hrAttendanceData');
    if (!payloadElement) return;

    let attendanceData = { present: 0, absent: 0, on_leave: 0 };
    try {
        attendanceData = JSON.parse(payloadElement.textContent || '{}');
    } catch (error) {
        console.warn('Invalid HR attendance data payload', error);
    }

    if (typeof renderHrAttendancePieChart === 'function') {
        renderHrAttendancePieChart('attendanceChart', attendanceData);
    }
}

/* =================================
   DASHBOARD DATA
   ================================= */

function loadDashboardData() {
    const totalEmployeesEl = document.getElementById('totalEmployees');
    const activeEmployeesEl = document.getElementById('activeEmployees');
    const onLeaveEl = document.getElementById('onLeave');
    
    if (totalEmployeesEl) {
        animateNumber(totalEmployeesEl, 0, Number(totalEmployeesEl.dataset.value || totalEmployeesEl.textContent || 0), 700);
    }
    if (activeEmployeesEl) {
        animateNumber(activeEmployeesEl, 0, Number(activeEmployeesEl.dataset.value || activeEmployeesEl.textContent || 0), 700);
    }
    if (onLeaveEl) {
        animateNumber(onLeaveEl, 0, Number(onLeaveEl.dataset.value || onLeaveEl.textContent || 0), 700);
    }
}

function animateNumber(element, start, end, duration) {
    let startTimestamp = null;
    
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value;
        
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    };
    
    requestAnimationFrame(step);
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