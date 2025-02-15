document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  const registerForm = document.getElementById("registerForm");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const passwordStrength = document.getElementById("passwordStrength");
  const strengthBar = passwordStrength.querySelector(".strength-bar");
  const strengthText = passwordStrength.querySelector(".strength-text");

  // Password strength checker
  passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;
    const strength = checkPasswordStrength(password);

    strengthBar.style.width = `${strength.score * 25}%`;
    strengthBar.className = `strength-bar ${strength.level}`;
    strengthText.textContent = `Password Strength: ${strength.level}`;
  });
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
  // Handle form submission
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      await register(email, password);
      alert("Registration successful! Please login.");
      window.location.href = "auth.html";
    } catch (error) {
      alert(error.message);
    }
  });
});

function checkPasswordStrength(password) {
  let score = 0;
  let level = "weak";

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Complexity checks
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Determine level
  if (score >= 4) level = "strong";
  else if (score >= 3) level = "medium";
  else if (score >= 2) level = "fair";

  return { score, level };
}

function register(email, password) {
  return new Promise((resolve, reject) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.find((user) => user.email === email)) {
      reject(new Error("User already exists"));
      return;
    }

    // Generate salt and hash password
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const hashedPassword = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 1000,
    }).toString();

    // Generate encryption key for user's data
    const encryptionKey = CryptoJS.lib.WordArray.random(256 / 8).toString();

    const newUser = {
      email,
      hashedPassword,
      salt,
      encryptionKey,
      created: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    resolve(true);
  });
}
