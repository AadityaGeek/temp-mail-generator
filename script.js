let account = null;
let token = null;
let inboxInterval = null;

async function generateAccount() {
  try {
    const username = Math.random().toString(36).substring(2, 10);

    // Get domains
    const domainRes = await fetch("https://api.mail.tm/domains");
    if (!domainRes.ok) {
      showAlert("Failed to fetch email domains. Please try again.");
      return;
    }

    const domainData = await domainRes.json();
    if (
      !domainData["hydra:member"] ||
      domainData["hydra:member"].length === 0
    ) {
      showAlert("No email domains available. Please try again later.");
      return;
    }

    const domain = domainData["hydra:member"][0].domain;
    const address = `${username}@${domain}`;
    const password = "password123";

    // Create account
    const res = await fetch("https://api.mail.tm/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, password }),
    });

    if (!res.ok) {
      showAlert("Failed to create temp email. Please try again.");
      return;
    }

    account = { address, password };
    document.getElementById("emailDisplay").innerText = address;

    // Login
    const loginRes = await fetch("https://api.mail.tm/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, password }),
    });

    if (!loginRes.ok) {
      showAlert("Account created but failed to login. Please try again.");
      return;
    }

    const loginData = await loginRes.json();
    token = loginData.token;

    // Start polling inbox
    if (inboxInterval) clearInterval(inboxInterval);
    checkInbox();
    inboxInterval = setInterval(checkInbox, 5000);

    showAlert("Email account created successfully!");
  } catch (error) {
    showAlert("An error occurred. Please try again.");
    console.error(error);
  }
}

function showAlert(message) {
  const alert = document.getElementById("alert");
  const alertMessage = document.getElementById("alertMessage");
  alertMessage.textContent = message;
  alert.classList.add("show");

  // Auto hide after 3 seconds
  setTimeout(() => {
    closeAlert();
  }, 3000);
}

function closeAlert() {
  const alert = document.getElementById("alert");
  alert.classList.remove("show");
}

function copyEmail() {
  const email = document.getElementById("emailDisplay").innerText;

  // Check if email is blank or contains the default "---"
  if (!email || email === "---") {
    showAlert("Please generate an email first!");
    return;
  }

  navigator.clipboard
    .writeText(email)
    .then(() => {
      showAlert("Email copied to clipboard!");
    })
    .catch(() => {
      showAlert("Failed to copy email");
    });
}

function manualRefresh() {
  const icon = document.getElementById("refreshIcon");
  icon.classList.add("spin");
  checkInbox().then(() => {
    setTimeout(() => icon.classList.remove("spin"), 1000);
  });
}

async function checkInbox() {
  if (!token) return;

  const inboxRes = await fetch("https://api.mail.tm/messages", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const inboxData = await inboxRes.json();
  const messages = inboxData["hydra:member"];

  const inbox = document.getElementById("inbox");

  // Only clear the inbox if there are no messages
  if (messages.length === 0) {
    inbox.innerHTML = "<p>No messages yet.</p>";
    return;
  }

  // Check if we need to update the inbox
  const existingMessages = inbox.querySelectorAll(".message");
  if (existingMessages.length === messages.length) {
    // Same number of messages, no need to refresh
    return;
  }

  // Clear and rebuild inbox only if message count changed
  inbox.innerHTML = "";

  for (let msg of messages) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.innerHTML = `
      <div class="message-header">
        <strong>From:</strong> ${msg.from.address}<br>
        <strong>Subject:</strong> ${msg.subject}<br>
        <strong>Preview:</strong> ${msg.intro}
      </div>
    `;
    messageDiv.onclick = () => showMessage(msg.id, messageDiv);
    inbox.appendChild(messageDiv);
  }
}

async function showMessage(id, div) {
  // Check if message body is already shown
  let bodyDiv = div.querySelector(".message-body");

  if (bodyDiv) {
    bodyDiv.remove(); // Toggle off
    return;
  }

  try {
    const res = await fetch(`https://api.mail.tm/messages/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch message");
    }

    const data = await res.json();
    const body = data.text || "No message content.";

    const newDiv = document.createElement("div");
    newDiv.classList.add("message-body");

    // Create a container for the email content
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("message-content");
    contentDiv.innerHTML = linkify(body); // <-- changed from innerText to innerHTML

    // Create controls for the message
    const controlsDiv = document.createElement("div");
    controlsDiv.classList.add("message-controls");

    // Add a close button
    const closeButton = document.createElement("button");
    closeButton.classList.add("message-close");
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.onclick = (e) => {
      e.stopPropagation(); // Prevent event from bubbling up
      newDiv.remove();
    };

    // Add a copy button
    const copyButton = document.createElement("button");
    copyButton.classList.add("message-copy");
    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
    copyButton.onclick = (e) => {
      e.stopPropagation(); // Prevent event from bubbling up
      navigator.clipboard
        .writeText(body)
        .then(() => showAlert("Message content copied to clipboard!"))
        .catch(() => showAlert("Failed to copy message content"));
    };

    // Add buttons to controls
    controlsDiv.appendChild(copyButton);
    controlsDiv.appendChild(closeButton);

    // Add both content and controls to the message body
    newDiv.appendChild(contentDiv);
    newDiv.appendChild(controlsDiv);

    // Add click stop propagation to prevent collapse when clicking inside
    newDiv.onclick = (e) => {
      e.stopPropagation();
    };

    div.appendChild(newDiv);
  } catch (error) {
    console.error("Error fetching message:", error);
    showAlert("Failed to load message content");
  }
}

async function deleteAccount() {
  if (!token || !account) {
    showAlert("No active email to delete");
    return;
  }

  // Clear the current account
  account = null;
  token = null;

  // Clear the display
  document.getElementById("emailDisplay").innerText = "---";
  document.getElementById("inbox").innerHTML = "<p>No messages yet.</p>";

  // Clear the interval
  if (inboxInterval) {
    clearInterval(inboxInterval);
    inboxInterval = null;
  }

  // Generate new account
  await generateAccount();
  showAlert("Email address deleted and new one generated!");
}

document.querySelector(".action-button.delete").onclick = deleteAccount;

// Set current year in footer
document.getElementById("currentYear").textContent = new Date().getFullYear();

// Mobile menu toggle
const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
const mainNav = document.querySelector(".main-nav");

mobileMenuBtn.addEventListener("click", function () {
  mainNav.classList.toggle("show");
});

// Close mobile menu when clicking on a nav link
const navLinks = document.querySelectorAll(".main-nav a");
navLinks.forEach((link) => {
  link.addEventListener("click", function () {
    mainNav.classList.remove("show");
  });
});

// Add this at the end of the file
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));

    if (target) {
      // Close mobile menu if open
      document.querySelector(".main-nav").classList.remove("show");

      // Smooth scroll to target
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Update active state
      document.querySelectorAll(".main-nav a").forEach((link) => {
        link.classList.remove("active");
      });
      this.classList.add("active");
    }
  });
});

// Update active menu item on scroll
window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll("section, div[id]");
  const navLinks = document.querySelectorAll(".main-nav a");

  let currentSection = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;

    if (window.pageYOffset >= sectionTop - 60) {
      currentSection = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href").substring(1) === currentSection) {
      link.classList.add("active");
    }
  });
});

function linkify(text) {
  // Regex to match URLs (http, https)
  return text.replace(
    /(https?:\/\/[^\s\]\)]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}
