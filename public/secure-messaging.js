document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  const securityCodeForm = document.getElementById("securityCodeForm");
  const chatWindow = document.getElementById("chatWindow");
  const enterChatBtn = document.getElementById("enterChatBtn");
  const messageForm = document.getElementById("messageForm");
  const messageInput = document.getElementById("messageInput");
  const messageList = document.getElementById("messageList");
  const logoutBtn = document.getElementById("logoutBtn");
  const generateChatBtn = document.getElementById("generateChatBtn");
  const chatCodeDisplay = document.getElementById("chatCodeDisplay");
  const goBackBtn = document.getElementById("GoBack");
  let currentChatId = null;

  if (!checkAuth()) {
      window.location.href = "auth.html";
      return;
  }

  function displayChatCode(code) {
      chatCodeDisplay.textContent = `Chat Code: ${code}`;
      chatCodeDisplay.style.display = "block";
  }

  generateChatBtn.addEventListener("click", async () => {
      const session = JSON.parse(localStorage.getItem("session"));
      const email = session.email;
      try {
          const response = await fetch("http://localhost:3000/chats", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ user_email: email }),
          });
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          currentChatId = data.chat_id;
          localStorage.setItem('currentChatId', currentChatId);
          displayChatCode(currentChatId);
          securityCodeForm.style.display = "none";
          chatWindow.style.display = "block";
          loadMessages(); // Load messages instead of listening
      } catch (error) {
          console.error("Failed to create chat:", error);
          alert("Failed to create chat. Please try again.");
      }
  });

  enterChatBtn.addEventListener("click", async () => {
      const securityCode = document.getElementById("securityCode").value;
      if (securityCode.length === 6) {
          try {
              const response = await fetch(
                  `http://localhost:3000/chats/${securityCode}`
              );
              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
              }
              const data = await response.json();
              currentChatId = data.chat_id;
              localStorage.setItem('currentChatId', currentChatId);
              displayChatCode(currentChatId);
              securityCodeForm.style.display = "none";
              chatWindow.style.display = "block";
              loadMessages(); // Load messages instead of listening
          } catch (error) {
              console.error("Failed to join chat:", error);
              alert("Invalid security code. Please try again.");
          }
      } else {
          alert("Please enter a valid 6-digit security code.");
      }
  });

  messageForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const message = messageInput.value.trim();
      if (message) {
          await sendMessage(message);
          messageInput.value = "";
          loadMessages(); // Reload messages after sending
      }
  });

  logoutBtn.addEventListener("click", () => {
      logout();
  });

  // if (goBackBtn) {
  //     goBackBtn.addEventListener("click", () => {
  //         localStorage.removeItem('currentChatId');
  //         window.location.href = "secure-messaging.html";
  //     });
  // }

  async function sendMessage(content) {
      const session = JSON.parse(localStorage.getItem("session"));
      try {
          const response = await fetch("http://localhost:3000/messages", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({
                  chat_id: currentChatId,
                  sender: session.email,
                  content: content,
              }),
          });
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
      } catch (error) {
          console.error("Failed to send message:", error);
      }
  }

  async function loadMessages() {
      try {
          const response = await fetch(
              `http://localhost:3000/messages/${currentChatId}`
          );
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          const messages = await response.json();
          renderMessages(messages);
      } catch (error) {
          console.error("Failed to load messages:", error);
      }
  }

  function renderMessages(messages) {
      messageList.innerHTML = "";
      const session = JSON.parse(localStorage.getItem("session"));
      messages.forEach((m) => {
          const messageElement = document.createElement("div");
          messageElement.className = `message ${
              m.sender === session.email ? "sent" : "received"
          }`;
          messageElement.textContent = m.content;
          messageList.appendChild(messageElement);
      });
      messageList.scrollTop = messageList.scrollHeight;
  }

  function checkAuth() {
      const session = JSON.parse(localStorage.getItem("session"));
      if (!session) {
          window.location.href = "auth.html";
          return false;
      }
      if (new Date().getTime() - session.timestamp > 24 * 60 * 60 * 1000) {
          localStorage.removeItem("session");
          return false;
      }
      return true;
  }

  function logout() {
      localStorage.removeItem("session");
      window.location.href = "auth.html";
  }

  const storedChatId = localStorage.getItem('currentChatId');
  if (storedChatId) {
      currentChatId = storedChatId;
      displayChatCode(currentChatId);
      securityCodeForm.style.display = "none";
      chatWindow.style.display = "block";
      loadMessages();
  }
  // ADDED SECTION
  const reloadButton = document.querySelector("#GoBack");
  reloadButton.addEventListener("click", ()=>{
      loadMessages();
  });

  // ADDED SECTION
});

document.querySelector('#leaveChatBtn').addEventListener('click', function(){
  securityCodeForm.style.display = "block";
  chatCodeDisplay.style.display = "none";
});
