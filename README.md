# 🚀 GitHub Automation Hub

A modern, dark-themed web application for configuring GitHub automation workflows with n8n. Features secure token storage, intuitive repository management, and seamless webhook integration.

![GitHub Automation Hub](https://img.shields.io/badge/Version-2.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Modern UI](https://img.shields.io/badge/UI-Dark%20Mode-black?style=for-the-badge)

## ✨ Features

### 🔐 **Secure Token Management**
- **Local Storage**: GitHub tokens are securely stored in your browser's local storage
- **Token Validation**: Real-time validation for GitHub token formats (PAT, App tokens, OAuth)
- **Visual Indicators**: Clear status indicators showing token storage state
- **Privacy First**: Tokens never leave your device except when submitting to your webhook

### 📦 **Advanced Repository Management**
- **Multiple Repositories**: Add up to 10 GitHub repositories for automation
- **Bulk Operations**: Paste multiple repository URLs at once
- **URL Validation**: Real-time validation of GitHub repository URLs
- **Context Menu**: Right-click repository fields for advanced options
- **Auto-Save**: Form state automatically saved to prevent data loss

### 🌐 **Modern User Experience**
- **Dark Mode**: Beautiful dark theme with modern design principles
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Keyboard Shortcuts**: Efficient workflow with keyboard navigation
- **Visual Feedback**: Real-time validation and status messages
- **Smooth Animations**: Polished interactions and transitions

### 🔗 **n8n Integration**
- **Webhook Testing**: Test your n8n webhook connection before submitting
- **Structured Data**: Clean, well-formatted JSON payload for n8n workflows
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Metadata**: Additional context sent with each automation request

## 🏗️ Project Structure

```
github-automation-hub/
├── src/
│   ├── index.html              # Main application entry point
│   ├── styles/
│   │   └── main.css           # Modern dark theme styles
│   ├── scripts/
│   │   └── main.js            # Core application logic
│   └── components/
│       └── form.js            # Enhanced form interactions
├── package.json               # Project configuration
└── README.md                  # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Python 3.x (comes pre-installed on macOS and most Linux distributions)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd github-automation-hub
   ```

2. **Start the server** (No dependencies needed!)
   ```bash
   npm start
   ```
   
   Or directly with Python:
   ```bash
   python3 -m http.server 3000 --directory src
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000` to access the application.

### Zero Dependencies Setup
This application requires **no npm dependencies** and has **zero vulnerabilities**. It uses Python's built-in HTTP server for local development, which is secure and lightweight.

## 💡 Usage Guide

### 1. Configure GitHub Token
- Enter your GitHub Personal Access Token (PAT) or App token
- The token is validated in real-time and stored securely in local storage
- Supported token formats:
  - Personal Access Tokens: `ghp_xxxxxx`
  - GitHub App Tokens: `ghs_xxxxxx`
  - OAuth Tokens: `gho_xxxxxx`
  - Fine-grained PATs: `github_pat_xxxxxx`

### 2. Add Target Repositories
- Add GitHub repository URLs one by one using the "Add Repository" button
- Or paste multiple URLs at once using the context menu (right-click)
- Each repository URL is validated to ensure it's a valid GitHub repository
- Maximum of 10 repositories per automation workflow

### 3. Configure n8n Webhook (One-time setup)
- Open `src/scripts/main.js`
- Update the `WEBHOOK_CONFIG.url` with your n8n webhook URL
- Example: `url: 'https://your-n8n-instance.com/webhook/github-automation'`

### 4. Start Automation
- Submit the form to send data to your n8n webhook
- Monitor the status messages for real-time feedback
- The application will confirm successful submission

## 🔧 API Reference

### Webhook Payload Structure

When you submit the form, the following JSON structure is sent to your n8n webhook:

```json
{
  "githubToken": "ghp_xxxxxxxxxxxxxxxxxxxx",
  "repositories": [
    "https://github.com/username/repo1",
    "https://github.com/username/repo2"
  ],
  "metadata": {
    "timestamp": "2025-08-26T10:30:00.000Z",
    "userAgent": "GitHub Automation Hub v2.0",
    "repositoryCount": 2,
    "submissionId": "gah_1629975000000_abc123def"
  }
}
```

### HTTP Headers
- `Content-Type: application/json`
- `X-Automation-Source: GitHub-Automation-Hub`
- `X-Submission-ID: gah_1629975000000_abc123def`

## ⚙️ Configuration

### Setting up the n8n Webhook URL

1. Open `src/scripts/main.js`
2. Find the `WEBHOOK_CONFIG` object at the top of the file
3. Replace the placeholder URL with your actual n8n webhook URL:

```javascript
const WEBHOOK_CONFIG = {
    url: 'https://your-n8n-instance.com/webhook/github-automation',
    // Examples:
    // url: 'https://n8n.yourcompany.com/webhook/github-automation'
    // url: 'http://localhost:5678/webhook/github-automation'
};
```

### Expected n8n Response

The application can handle JSON responses from n8n. Your workflow can return:

```json
{
  "success": true,
  "message": "Automation workflow started successfully",
  "workflowId": "workflow_12345",
  "processedRepositories": 2
}
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Enter` | Submit form |
| `Ctrl/Cmd + Shift + R` | Add new repository field |
| `Escape` | Clear focus from current input |

## 🎨 Customization

### Color Scheme
The application uses CSS custom properties for easy theme customization. Edit the `:root` section in `src/styles/main.css`:

```css
:root {
    --primary-bg: #0d1117;
    --secondary-bg: #161b22;
    --accent-blue: #58a6ff;
    /* ... other variables */
}
```

### Webhook URL Management
You can set a default webhook URL by modifying the JavaScript in `src/scripts/main.js`.

## 🛠️ Development

### Scripts
- `npm start` - Start Python HTTP server on port 3000 (zero dependencies)
- `npm run serve` - Alternative start command
- `npm run open` - Open browser to localhost:3000
- `npm run build` - No build process needed (static site)
- `npm test` - Run tests (not yet implemented)

### Zero Dependencies Architecture
This application is built with vanilla JavaScript, HTML, and CSS - no frameworks, no build tools, no vulnerabilities. The development server uses Python's built-in `http.server` module for maximum security and simplicity.

### Code Structure
- **main.js**: Core application logic, form handling, webhook communication
- **form.js**: Enhanced form interactions, keyboard shortcuts, validation
- **main.css**: Modern dark theme, responsive design, animations

## 🔒 Security Features

- **Local-Only Storage**: Tokens are stored only in browser local storage
- **No External Dependencies**: No tracking or analytics
- **HTTPS Recommended**: Use HTTPS for production deployments
- **Token Validation**: Client-side validation prevents invalid tokens
- **Secure Transmission**: Tokens only sent to your specified webhook

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📝 n8n Workflow Integration

### Sample n8n Workflow Node
```json
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "github-automation",
        "responseMode": "responseNode"
      },
      "name": "GitHub Automation Webhook",
      "type": "n8n-nodes-base.webhook"
    }
  ]
}
```

### Accessing Data in n8n
```javascript
// Access the GitHub token
const githubToken = $json.githubToken;

// Access repositories array
const repositories = $json.repositories;

// Access metadata
const timestamp = $json.metadata.timestamp;
const repoCount = $json.metadata.repositoryCount;
const submissionId = $json.metadata.submissionId;

// Process each repository
for (const repoUrl of repositories) {
    // Your automation logic here
    console.log(`Processing repository: ${repoUrl}`);
}
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Test your changes thoroughly
- Update documentation as needed
- Ensure responsive design compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web standards and best practices
- Inspired by GitHub's dark theme design
- Font Awesome icons for beautiful UI elements
- Inter font family for optimal readability

## 📞 Support

If you encounter any issues or have questions:

1. Check the existing issues in the repository
2. Create a new issue with a detailed description
3. Include browser information and steps to reproduce

---

**Made with ❤️ for the n8n automation community**# General_Code_Reviewer
