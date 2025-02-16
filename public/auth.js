document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();

    // Handle password visibility toggle
    const togglePassword = document.querySelector(".toggle-password");

    if (togglePassword) {
        togglePassword.addEventListener("click", function () {
            const passwordInput = document.querySelector("#password");
            const showIcon = this.querySelector(".show-password");
            const hideIcon = this.querySelector(".hide-password");
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                showIcon.style.display = "none";
                hideIcon.style.display = "block";
            } else {
                passwordInput.type = "password";
                showIcon.style.display = "block";
                hideIcon.style.display = "none";
            }
        });
    }

    // Handle login form submission
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            try {
                const success = await login(email, password);
                if (success) {
                    window.location.href = "dashboard.html";
                }
            } catch (error) {
                alert(error.message);
            }
        });
    }

    // User authentication functions
    async function login(email, password) {
        try {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);

            // Store session
            const session = {
                email: userCredential.user.email,
                timestamp: new Date().getTime(),
            };
            localStorage.setItem("session", JSON.stringify(session)); // Still use local storage for basic session management
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            throw new Error(error.message);
        }
    }

    // Check if user is logged in
    function checkAuth() {
        const session = JSON.parse(localStorage.getItem("session"));
        if (!session) {
            window.location.href = "auth.html";
            return false;
        }

        // Check session expiry (24 hours)
        if (new Date().getTime() - session.timestamp > 24 * 60 * 60 * 1000) {
            localStorage.removeItem("session");
            window.location.href = "auth.html";
            return false;
        }
        return true;
    }

    // Logout function
    function logout() {
        localStorage.removeItem("session");
        firebase.auth().signOut().then(() => {
            window.location.href = "auth.html";
        }).catch((error) => {
            console.error("Logout failed:", error);
            window.location.href = "auth.html"; // Redirect anyway
        });

    }
});
