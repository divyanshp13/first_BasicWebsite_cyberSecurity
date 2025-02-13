document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // Check if user is authenticated
    if (!checkAuth()) {
        return;
    }

    // Get user session
    const session = JSON.parse(localStorage.getItem('session'));
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage && session) {
        welcomeMessage.textContent = `Welcome, ${session.email}`;
    }

    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }
});