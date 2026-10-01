let account = null;
let token = null;
let inboxInterval = null;
let isCheckingInbox = false;

async function generateAccount() {
  try {
    const res = await fetch(
      "https://api.guerrillamail.com/ajax.php?f=get_email_address"
    );
    if (!res.ok) {
      showAlert("Failed to create temp email. Please try again.");
      return;
    }

    const data = await res.json();
    if (!data.email_addr || !data.sid_token) {
      showAlert("Failed to create temp email. Please try again.");
      return;
    }

    account = { address: data.email_addr };
    token = data.sid_token;

    document.getElementById("emailDisplay").innerText = account.address;
    localStorage.setItem("tm_account", JSON.stringify(account));
    localStorage.setItem("tm_token", token);

    // Reset inbox display
    document.getElementById("inbox").innerHTML = "<p>No messages yet.</p>";

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
  const copyIcons = document.querySelectorAll(".fa-copy");

  // Animate all copy icons
  copyIcons.forEach((icon) => {
    icon.classList.remove("icon-animate-copy");
    // Force reflow to restart animation
    void icon.offsetWidth;
    icon.classList.add("icon-animate-copy");
  });

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
  const icons = document.querySelectorAll(".fa-sync-alt");
  icons.forEach((icon) => {
    icon.classList.remove("icon-animate-refresh");
    void icon.offsetWidth;
    icon.classList.add("icon-animate-refresh");
  });
  checkInbox().finally(() => {
    setTimeout(() => {
      icons.forEach((icon) => icon.classList.remove("icon-animate-refresh"));
    }, 800);
  });
}

// Add this function to manage read message IDs
function getReadMessages() {
  const stored = localStorage.getItem("tm_read_messages");
  return stored ? JSON.parse(stored) : [];
}

function markMessageAsRead(messageId) {
  const readMessages = getReadMessages();
  const idStr = String(messageId);
  if (!readMessages.includes(idStr)) {
    readMessages.push(idStr);
    localStorage.setItem("tm_read_messages", JSON.stringify(readMessages));
  }
}

async function checkInbox() {
  if (!token || isCheckingInbox) return;
  isCheckingInbox = true;

  try {
    // 1. Trigger the server to process any new incoming messages
    try {
      await fetch(
        `https://api.guerrillamail.com/ajax.php?f=check_email&seq=0&sid_token=${token}`
      );
    } catch (e) {
      // Ignore network glitch on pre-trigger
    }

    // 2. Fetch the complete persistent inbox list
    const inboxRes = await fetch(
      `https://api.guerrillamail.com/ajax.php?f=get_email_list&offset=0&sid_token=${token}`
    );

    if (!inboxRes.ok) return;

    const inboxData = await inboxRes.json();

    if (inboxData.error) {
      if (inboxInterval) {
        clearInterval(inboxInterval);
        inboxInterval = null;
      }
      account = null;
      token = null;
      localStorage.removeItem("tm_account");
      localStorage.removeItem("tm_token");
      document.getElementById("emailDisplay").innerText = "---";
      document.getElementById("inbox").innerHTML =
        "<p>Session expired. Please generate a new email.</p>";
      return;
    }

    const messages = Array.isArray(inboxData.list) ? inboxData.list : [];
    const inbox = document.getElementById("inbox");

    // Only clear the inbox if there are no messages
    if (messages.length === 0) {
      inbox.innerHTML = "<p>No messages yet.</p>";
      return;
    }

    // Check if we need to update the inbox
    const existingIds = Array.from(inbox.querySelectorAll(".message"))
      .map((m) => m.dataset.messageId)
      .join(",");
    const newIds = messages.map((m) => String(m.mail_id)).join(",");

    if (existingIds === newIds) {
      // Same messages, no need to refresh DOM
      return;
    }

    // Check if any message is currently expanded so we can keep it open
    const expandedId = inbox
      .querySelector(".message-body")
      ?.closest(".message")?.dataset.messageId;

    // Clear and rebuild inbox
    inbox.innerHTML = "";
    const readMessages = getReadMessages();

    for (let msg of messages) {
      const msgId = String(msg.mail_id);
      let formattedDate;
      if (msg.mail_timestamp && Number(msg.mail_timestamp) > 0) {
        formattedDate = new Date(Number(msg.mail_timestamp) * 1000).toLocaleString();
      } else if (msg.mail_date) {
        formattedDate = msg.mail_date;
      } else {
        formattedDate = new Date().toLocaleString();
      }

      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message");

      const isRead = Number(msg.mail_read) === 1 || readMessages.includes(msgId);
      messageDiv.classList.add(isRead ? "read" : "unread");
      messageDiv.dataset.messageId = msgId;

      messageDiv.innerHTML = `
        <div class="message-header">
          <strong>From:</strong> ${escapeHtml(msg.mail_from)}<br>
          <strong>Subject:</strong> ${escapeHtml(msg.mail_subject || "(No Subject)")}<br>
          <strong>Time:</strong> ${escapeHtml(formattedDate)}<br>
          <strong>Preview:</strong> ${escapeHtml(msg.mail_excerpt || "")}
        </div>
      `;
      messageDiv.onclick = () => showMessage(msgId, messageDiv, msg.mail_body);
      inbox.appendChild(messageDiv);

      // Reopen message body if it was previously open
      if (expandedId && expandedId === msgId) {
        showMessage(msgId, messageDiv, msg.mail_body);
      }
    }
  } catch (error) {
    console.error("Error checking inbox:", error);
  } finally {
    isCheckingInbox = false;
  }
}

async function showMessage(id, div, cachedBody) {
  // Mark message as read when opened
  div.classList.remove("unread");
  div.classList.add("read");
  markMessageAsRead(id);

  // Check if message body is already shown
  let bodyDiv = div.querySelector(".message-body");

  if (bodyDiv) {
    bodyDiv.remove(); // Toggle off
    return;
  }

  try {
    let body = cachedBody;

    if (!body) {
      const res = await fetch(
        `https://api.guerrillamail.com/ajax.php?f=fetch_email&email_id=${id}&sid_token=${token}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch message");
      }

      const data = await res.json();
      body = data.mail_body || "No message content.";
    }

    const newDiv = document.createElement("div");
    newDiv.classList.add("message-body");

    // Header toolbar with title and action buttons at top
    const toolbarDiv = document.createElement("div");
    toolbarDiv.classList.add("message-toolbar");

    const toolbarTitle = document.createElement("span");
    toolbarTitle.classList.add("message-toolbar-title");
    toolbarTitle.innerHTML = '<i class="fas fa-envelope-open-text"></i> Message Content';

    // Controls
    const controlsDiv = document.createElement("div");
    controlsDiv.classList.add("message-controls");

    // Add a copy button
    const copyButton = document.createElement("button");
    copyButton.classList.add("message-copy");
    copyButton.setAttribute("title", "Copy email content");
    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
    copyButton.onclick = (e) => {
      e.stopPropagation(); // Prevent event from bubbling up
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = body;
      const textToCopy = tempDiv.textContent || tempDiv.innerText || body;
      navigator.clipboard
        .writeText(textToCopy.trim())
        .then(() => showAlert("Message content copied to clipboard!"))
        .catch(() => showAlert("Failed to copy message content"));
    };

    // Add a close button
    const closeButton = document.createElement("button");
    closeButton.classList.add("message-close");
    closeButton.setAttribute("title", "Close message");
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.onclick = (e) => {
      e.stopPropagation(); // Prevent event from bubbling up
      newDiv.remove();
    };

    controlsDiv.appendChild(copyButton);
    controlsDiv.appendChild(closeButton);

    toolbarDiv.appendChild(toolbarTitle);
    toolbarDiv.appendChild(controlsDiv);

    // Create a container for the email content
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("message-content");
    contentDiv.innerHTML = formatMessageBody(body);

    newDiv.appendChild(toolbarDiv);
    newDiv.appendChild(contentDiv);

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

  // Animate delete icon
  const deleteIcon = document.querySelector(".action-button.delete i");
  if (deleteIcon) {
    deleteIcon.classList.remove("icon-animate-delete");
    void deleteIcon.offsetWidth;
    deleteIcon.classList.add("icon-animate-delete");
  }

  try {
    if (account.address && token) {
      await fetch(
        `https://api.guerrillamail.com/ajax.php?f=forget_me&email_addr=${encodeURIComponent(
          account.address
        )}&sid_token=${token}`
      );
    }
  } catch (e) {
    console.warn("Failed to notify server of deletion", e);
  }

  // Clear the inbox and account info
  document.getElementById("inbox").innerHTML = "<p>No messages yet.</p>";
  document.getElementById("emailDisplay").innerText = "---";
  account = null;
  token = null;
  localStorage.removeItem("tm_account");
  localStorage.removeItem("tm_token");
  localStorage.removeItem("tm_read_messages"); // Clear read status too

  showAlert("Email address deleted!");

  if (inboxInterval) {
    clearInterval(inboxInterval);
    inboxInterval = null;
  }
}

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

function showQRCode() {
  const email = document.getElementById("emailDisplay").innerText;
  if (!email || email === "---") {
    showAlert("Please generate an email first!");
    return;
  }

  // Clear previous QR code
  const qrContainer = document.getElementById("qrcode");
  qrContainer.innerHTML = "";

  // Generate new QR code encoding a mailto: URI
  new QRCode(qrContainer, {
    text: `mailto:${email}`,
    width: 220,
    height: 220,
    colorDark: "#0f172a",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });

  document.getElementById("qrEmailLabel").textContent = email;
  document.getElementById("qrModal").classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeQRModal() {
  document.getElementById("qrModal").classList.remove("show");
  document.body.style.overflow = "";
}

// Close QR modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeQRModal();
});

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMessageBody(body) {
  if (!body) return "<em>No message content.</em>";
  // If the body already contains HTML tags, ensure links open safely in a new tab
  if (/<[a-z][\s\S]*>/i.test(body)) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = body;
    tempDiv.querySelectorAll("a").forEach((a) => {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });
    return tempDiv.innerHTML;
  }
  // Plain text: escape HTML and detect URLs
  return linkify(escapeHtml(body));
}

function linkify(text) {
  // Regex to match URLs (http, https)
  return text.replace(
    /(https?:\/\/[^\s<>"']+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

// Restore account and token from localStorage on page load
window.addEventListener("DOMContentLoaded", () => {
  const savedAccount = localStorage.getItem("tm_account");
  const savedToken = localStorage.getItem("tm_token");
  if (savedAccount && savedToken) {
    try {
      account = JSON.parse(savedAccount);
      token = savedToken;
      // If old mail.gw token or invalid session, clean it up
      if (
        token.includes(".") ||
        !account.address ||
        account.address.includes("@mail.gw")
      ) {
        account = null;
        token = null;
        localStorage.removeItem("tm_account");
        localStorage.removeItem("tm_token");
        return;
      }
      document.getElementById("emailDisplay").innerText = account.address;
      checkInbox();
      inboxInterval = setInterval(checkInbox, 5000);
    } catch (e) {
      account = null;
      token = null;
      localStorage.removeItem("tm_account");
      localStorage.removeItem("tm_token");
    }
  }
});


