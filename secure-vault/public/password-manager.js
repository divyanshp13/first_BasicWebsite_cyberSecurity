// import * as lucide from "lucide"

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons()

  const addPasswordBtn = document.getElementById("addPasswordBtn")
  const passwordModal = document.getElementById("passwordModal")
  const passwordForm = document.getElementById("passwordForm")
  const cancelBtn = document.getElementById("cancelBtn")
  const passwordList = document.getElementById("passwordList")
  const searchInput = document.getElementById("searchInput")
  const logoutBtn = document.getElementById("logoutBtn")

  let passwords = []
  let editingId = null

  // Check authentication
  if (!checkAuth()) {
    window.location.href = "auth.html"
    return
  }

  // Load passwords
  loadPasswords()
//visibility of password
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

  addPasswordBtn.addEventListener("click", () => {
    editingId = null
    document.getElementById("modalTitle").textContent = "Add Password"
    passwordForm.reset()
    passwordModal.style.display = "block"
  })

  cancelBtn.addEventListener("click", () => {
    passwordModal.style.display = "none"
  })

  passwordForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const siteName = document.getElementById("siteName").value
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value

    if (editingId) {
      await updatePassword(editingId, siteName, username, password)
    } else {
      await addPassword(siteName, username, password)
    }

    passwordModal.style.display = "none"
    loadPasswords()
  })

  searchInput.addEventListener("input", () => {
    loadPasswords();
    const searchTerm = searchInput.value.toLowerCase()
    const filteredPasswords = passwords.filter(
      (p) => p.siteName.toLowerCase().includes(searchTerm) || p.username.toLowerCase().includes(searchTerm),
    )
    renderPasswords(filteredPasswords)
  })

  logoutBtn.addEventListener("click", () => {
    logout()
  })

  async function loadPasswords() {
    const session = JSON.parse(localStorage.getItem("session"));
    const email = session.email;
    const searchTerm = searchInput.value.toLowerCase();
 
    try {
      const response = await fetch(`http://localhost:3000/passwords/${email}?searchTerm=${searchTerm}`);  // Adjust URL if needed
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      passwords = await response.json();
      renderPasswords(passwords);
    } catch (error) {
      console.error("Failed to load passwords:", error);
      // Handle error (e.g., display a message to the user)
    }
  }
  function renderPasswords(passwordsToRender) {
    passwordList.innerHTML = ""
    passwordsToRender.forEach((p) => {
      const passwordItem = document.createElement("div")
      passwordItem.className = "password-item"
      passwordItem.innerHTML = `
                <div class="password-info">
                    <h3>${p.siteName}</h3>
                    <p>${p.username}</p>
                </div>
                <div class="password-actions">
                    <button class="edit-btn" data-id="${p.id}"><i data-lucide="edit"></i></button>
                    <button class="delete-btn" data-id="${p.id}"><i data-lucide="trash-2"></i></button>
                </div>
            `
      passwordList.appendChild(passwordItem)
    })
    lucide.createIcons()

    // Add event listeners for edit and delete buttons
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => editPassword(btn.dataset.id))
    })
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => deletePassword(btn.dataset.id))
    })
  }

  async function addPassword(siteName, username, password) {
    const session = JSON.parse(localStorage.getItem("session"));
    const email = session.email;
 
    try {
      const response = await fetch("http://localhost:3000/passwords", {  // Adjust URL if needed
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_email: email, siteName, username, password }),
      });
 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
 
      const data = await response.json();
      // Optionally, handle the response (e.g., show a success message)
    } catch (error) {
      console.error("Failed to add password:", error);
      // Handle error (e.g., display a message to the user)
    }
  } 
  async function updatePassword(id, siteName, username, password) {
    try {
      const response = await fetch(`http://localhost:3000/passwords/${id}`, {  // Adjust URL if needed
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ siteName, username, password }),
      });
 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
 
      const data = await response.json();
      // Optionally, handle the response
    } catch (error) {
      console.error("Failed to update password:", error);
    }
  }
 

  function editPassword(id) {
    const password = passwords.find((p) => p.id === id)
    if (password) {
      editingId = id
      document.getElementById("modalTitle").textContent = "Edit Password"
      document.getElementById("siteName").value = password.siteName
      document.getElementById("username").value = password.username
      document.getElementById("password").value = password.password
      passwordModal.style.display = "block"
    }
  }

  async function deletePassword(id) {
    if (confirm("Are you sure you want to delete this password?")) {
      try {
        const response = await fetch(`http://localhost:3000/passwords/${id}`, {  // Adjust URL if needed
          method: "DELETE",
        });
 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
 
        loadPasswords(); // Refresh the password list
      } catch (error) {
        console.error("Failed to delete password:", error);
      }
    }
  }
   


})

// These functions should be defined in a shared auth.js file
function checkAuth() {
  const session = JSON.parse(localStorage.getItem("session"))
  if (!session) {
    return false
  }
  // Check session expiry (24 hours)
  if (new Date().getTime() - session.timestamp > 24 * 60 * 60 * 1000) {
    localStorage.removeItem("session")
    return false
  }
  return true
}

function logout() {
  localStorage.removeItem("session")
  window.location.href = "auth.html"
}

