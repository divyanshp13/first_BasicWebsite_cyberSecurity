document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Handle password visibility toggle
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.querySelector('#password');
            const showIcon = this.querySelector('.show-password');
            const hideIcon = this.querySelector('.hide-password');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                showIcon.style.display = 'none';
                hideIcon.style.display = 'block';
            } else {
                passwordInput.type = 'password';
                showIcon.style.display = 'block';
                hideIcon.style.display = 'none';
            }
        });
    }

    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const success = await login(email, password);
                if (success) {
                    window.location.href = 'dashboard.html';
                }
            } catch (error) {
                alert(error.message);
            }
        });
    }
});

// User authentication functions
function login(email, password) {
    return new Promise((resolve, reject) => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email);

        if (!user) {
            reject(new Error('User not found'));
            return;
        }

        // Hash the provided password with the stored salt
        const hashedPassword = CryptoJS.PBKDF2(password, user.salt, {
            keySize: 256/32,
            iterations: 1000
        }).toString();

        if (hashedPassword !== user.hashedPassword) {
            reject(new Error('Invalid password'));
            return;
        }

        // Store session
        const session = {
            email: user.email,
            encryptionKey: user.encryptionKey,
            timestamp: new Date().getTime()
        };
        localStorage.setItem('session', JSON.stringify(session));
        
        resolve(true);
    });
}

// Check if user is logged in
function checkAuth() {
    const session = JSON.parse(localStorage.getItem('session'));
    if (!session) {
        window.location.href = 'login.html';
        return false;
    }

    // Check session expiry (24 hours)
    if (new Date().getTime() - session.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('session');
        window.location.href = 'login.html';
        return false;
    }

    return true;
}

// Logout function
function logout() {
    localStorage.removeItem('session');
    window.location.href = 'login.html';
}