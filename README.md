# 📧 Temp Mail Generator

A modern, responsive temporary email service that provides instant disposable email addresses to protect your privacy and avoid spam. Built with vanilla JavaScript and powered by the Guerrilla Mail API.

https://github.com/user-attachments/assets/8f987b8e-2a18-4c17-9297-d0ef9e49b379

![Temp Mail Generator](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![CSS3](https://img.shields.io/badge/CSS3-Modern-blue)
![HTML5](https://img.shields.io/badge/HTML5-Semantic-orange)

---

## ✨ Features

- **🚀 Instant Email Generation:** Create temporary email addresses with a single click
- **📋 One-Click Copy:** Copy email addresses to clipboard instantly
- **📬 Real-time Inbox:** Automatic inbox refresh every 5 seconds with timestamp display
- **📱 Responsive Design:** Works seamlessly on desktop, tablet, and mobile devices
- **🔄 Auto-Refresh:** Manual and automatic inbox refresh capabilities
- **📧 Message Viewer:** Click to expand and view full email content with clickable links
- **🗑️ Quick Delete:** Delete current email and generate a new one
- **🎨 Modern UI:** Clean, dark-themed interface with smooth animations
- **🔒 Privacy-Focused:** No registration required, completely anonymous
- **⚡ Fast & Lightweight:** Pure vanilla JavaScript, no frameworks
- **📖 Read/Unread Status:** Visual indicators to distinguish between read and unread messages
- **⏰ Message Timestamps:** Display exact time when each email was received
- **🔗 Link Support:** Automatic link detection and formatting in email content

---

## 📸 Interface Preview

![Temp Mail Generator Screenshot](images/temp-mail-generator.png)

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Styling:** CSS Custom Properties (CSS Variables), Flexbox, Grid
- **Icons:** Font Awesome 6.5.1
- **API:** [Guerrilla Mail](https://www.guerrillamail.com/) - Free, CORS-enabled temporary email API
- **Browser APIs:** Clipboard API, Fetch API, LocalStorage API

---

## 📋 Prerequisites

- Modern web browser with JavaScript enabled
- Internet connection for API access
- No additional software installation required

---

## 🚀 Getting Started

### Option 1: Direct Download

1. **Download the project:**

   ```bash
   git clone https://github.com/AadityaGeek/temp-mail-generator.git
   # Or download as ZIP and extract
   ```

2. **Navigate to the project directory:**

   ```bash
   cd temp-mail-generator
   ```

3. **Open in browser:**
   - Open `index.html` in your web browser
   - Or use a local server (recommended for development)

### Option 2: Local Development Server

- **Using Python:**

  ```bash
  python -m http.server 8000
  ```

- **Using Node.js:**

  ```bash
  npm install -g http-server
  http-server
  ```

- **Using Live Server (VS Code extension):**
  - Install "Live Server" in VS Code
  - Right-click on `index.html` and select "Open with Live Server"

---

## 📖 Usage

1. **Generate Email:** Click the "Generate Temp Email" button to create a new temporary email address.
2. **Copy Address:** Use the copy button (📋) to copy the email address to your clipboard.
3. **Check Messages:** The inbox automatically refreshes every 5 seconds to show new emails with timestamps.
4. **View Messages:** Click on any message in the inbox to expand and view its full content.
5. **Read Status:** Unread messages appear with a cyan border and dot indicator; read messages are slightly dimmed.
6. **Refresh Manually:** Use the refresh button (🔄) to manually check for new messages.
7. **Delete & Regenerate:** Click the delete button (🗑️) to remove the current email and generate a new one.
8. **Persistent Sessions:** Your email session is saved and restored when you return to the page.

---

## 📁 Project Structure

```text
temp-mail-generator/
├── index.html          # Main HTML file with complete UI structure
├── style.css           # CSS styles with modern design and responsive layout
├── script.js           # JavaScript functionality and API integration
├── images/
│   └── temp-mail-generator.png  # Screenshot
└── README.md           # Project documentation (this file)
```

---

## 🔧 Configuration

The application uses the Guerrilla Mail API with the following endpoints:

- **Email Generation:** `https://api.guerrillamail.com/ajax.php?f=get_email_address`
- **Inbox Polling & List:** `https://api.guerrillamail.com/ajax.php?f=get_email_list` & `check_email`
- **Fetch Message:** `https://api.guerrillamail.com/ajax.php?f=fetch_email`
- **Forget / Delete Session:** `https://api.guerrillamail.com/ajax.php?f=forget_me`

No API keys or additional configuration are required.

---

## 🎨 UI/UX Features

- **Dark Theme:** Modern dark interface optimized for extended use
- **Visual Feedback:** Animated icons and smooth transitions
- **Message Status:** Clear visual distinction between read/unread emails
- **Responsive Design:** Optimized for all screen sizes
- **Accessibility:** Keyboard navigation and screen reader friendly
- **Auto-Save:** Session persistence using localStorage

---

## 🤝 Contributing

Contributions are welcome!

1. **Fork the repository**
2. **Create a feature branch:**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes:**  
   - Follow the existing code style  
   - Test your changes thoroughly  
   - Ensure responsive design is maintained
4. **Commit your changes:**

   ```bash
   git commit -m 'Add some amazing feature'
   ```

5. **Push to the branch:**

   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**

**Development Guidelines:**

- Use vanilla JavaScript (no frameworks)
- Maintain responsive design principles
- Follow existing CSS custom property patterns
- Ensure cross-browser compatibility
- Add appropriate error handling

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author & Contact

### Aaditya Kumar

- 🌐 GitHub: [@AadityaGeek](https://github.com/AadityaGeek)
- 💼 LinkedIn: [aadityakr](https://linkedin.com/in/aadityakr)
- 📧 Email: [work.aadityakumar@gmail.com](mailto:work.aadityakumar@gmail.com)

---

## 🙏 Acknowledgments

- **[Guerrilla Mail](https://www.guerrillamail.com/):** For the free, CORS-enabled temporary email API service
- **[Font Awesome](https://fontawesome.com/):** For the icons
- **Community:** Thanks to all contributors and users

---

## ⚠️ Important Notes

- **Temporary Use Only:** Do not use for important accounts or financial services
- **No Permanent Storage:** Messages are not stored permanently
- **Privacy:** Temporary emails are not suitable for sensitive communications
- **API Dependency:** This application depends on the Guerrilla Mail API service availability
- **Session Persistence:** Email sessions are saved locally but will expire after inactivity

---

## 🔮 Future Enhancements

- [ ] Email forwarding capabilities
- [ ] Custom domain selection
- [ ] Message search functionality
- [ ] Email export options
- [ ] Dark/Light theme toggle
- [ ] Multiple email management
- [ ] Browser extension version
- [ ] Email attachment support
- [ ] Message filtering and sorting

---

**⭐ If you find this project useful, please consider giving it a star on GitHub!**
