// GitHub Automation Hub - Main JavaScript

// 🔧 CONFIGURATION
// ================
// Set your n8n webhook URL here before using the application
const WEBHOOK_CONFIG = {
    // REPLACE THIS with your actual webhook URL from n8n:
    url: 'https://n8n.macandcode.cloud/webhook/YOUR_WEBHOOK_ID', // UPDATE THIS!
    
    // After creating a webhook in n8n, you'll get a URL like:
    // 'https://n8n.macandcode.cloud/webhook/a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    // Replace YOUR_WEBHOOK_ID above with your actual webhook ID
};

class GitHubAutomationHub {
    constructor() {
        this.storageKey = 'github_automation_token';
        this.webhookUrl = WEBHOOK_CONFIG.url;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadStoredData();
        this.updateTokenStatus();
    }

    bindEvents() {
        // Form submission
        document.getElementById('github-form').addEventListener('submit', this.handleSubmit.bind(this));
        
        // Token management
        document.getElementById('toggle-token').addEventListener('click', this.toggleTokenVisibility.bind(this));
        document.getElementById('clear-token').addEventListener('click', this.clearStoredToken.bind(this));
        document.getElementById('github-token').addEventListener('input', this.handleTokenInput.bind(this));
        
        // Repository management
        document.getElementById('add-repo').addEventListener('click', this.addRepositoryField.bind(this));
        this.bindRepositoryEvents();
    }

    bindRepositoryEvents() {
        const repoContainer = document.getElementById('repo-container');
        
        // Event delegation for dynamically added remove buttons
        repoContainer.addEventListener('click', (e) => {
            if (e.target.closest('.remove-repo-btn')) {
                this.removeRepositoryField(e.target.closest('.repo-input-group'));
            }
        });

        // Event delegation for repository input validation
        repoContainer.addEventListener('input', (e) => {
            if (e.target.classList.contains('repo-input')) {
                this.validateRepositoryUrl(e.target);
            }
        });
    }

    loadStoredData() {
        // Load stored token
        const storedToken = localStorage.getItem(this.storageKey);
        if (storedToken) {
            document.getElementById('github-token').value = storedToken;
        }
    }

    updateTokenStatus() {
        const tokenStatus = document.getElementById('token-status');
        const tokenIndicator = document.getElementById('token-indicator');
        const hasToken = localStorage.getItem(this.storageKey);

        if (hasToken) {
            tokenStatus.classList.add('has-token');
            tokenIndicator.textContent = 'Token Stored Securely';
        } else {
            tokenStatus.classList.remove('has-token');
            tokenIndicator.textContent = 'No Token Stored';
        }
    }

    handleTokenInput(e) {
        const token = e.target.value.trim();
        
        if (token) {
            // Only save to localStorage, no validation feedback while typing
            localStorage.setItem(this.storageKey, token);
            this.updateTokenStatus();
        } else {
            localStorage.removeItem(this.storageKey);
            this.updateTokenStatus();
        }
    }

    isValidGitHubToken(token) {
        // GitHub token patterns:
        // Personal Access Token: ghp_[36 characters]
        // GitHub App Token: ghs_[36 characters]
        // OAuth Token: gho_[36 characters]
        const tokenPatterns = [
            /^ghp_[a-zA-Z0-9]{36}$/,
            /^ghs_[a-zA-Z0-9]{36}$/,
            /^gho_[a-zA-Z0-9]{36}$/,
            /^github_pat_[a-zA-Z0-9_]{82}$/ // Fine-grained personal access tokens
        ];
        
        return tokenPatterns.some(pattern => pattern.test(token));
    }

    toggleTokenVisibility() {
        const tokenInput = document.getElementById('github-token');
        const toggleBtn = document.getElementById('toggle-token');
        const icon = toggleBtn.querySelector('i');

        if (tokenInput.type === 'password') {
            tokenInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            tokenInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    clearStoredToken() {
        if (confirm('Are you sure you want to clear the stored GitHub token?')) {
            localStorage.removeItem(this.storageKey);
            document.getElementById('github-token').value = '';
            this.updateTokenStatus();
            this.showStatusMessage('Token cleared from local storage', 'info');
        }
    }

    addRepositoryField() {
        const repoContainer = document.getElementById('repo-container');
        const repoCount = repoContainer.children.length;
        
        if (repoCount >= 10) {
            this.showStatusMessage('Maximum 10 repositories allowed', 'warning');
            return;
        }

        const repoInputGroup = document.createElement('div');
        repoInputGroup.className = 'repo-input-group';
        repoInputGroup.innerHTML = `
            <div class="input-wrapper">
                <input 
                    type="text" 
                    name="repo-url" 
                    placeholder="https://github.com/username/repository"
                    class="form-input repo-input"
                    required
                >
                <button type="button" class="remove-repo-btn" title="Remove repository">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        repoContainer.appendChild(repoInputGroup);
        
        // Focus on the new input
        const newInput = repoInputGroup.querySelector('.repo-input');
        newInput.focus();
    }

    removeRepositoryField(repoInputGroup) {
        const repoContainer = document.getElementById('repo-container');
        
        if (repoContainer.children.length > 1) {
            repoInputGroup.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                repoInputGroup.remove();
            }, 300);
        } else {
            this.showStatusMessage('At least one repository is required', 'warning');
        }
    }

    validateRepositoryUrl(input) {
        const url = input.value.trim();
        const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;
        
        if (url && !githubUrlPattern.test(url)) {
            input.style.borderColor = 'var(--accent-red)';
            this.showStatusMessage('Please enter a valid GitHub repository URL', 'warning');
        } else {
            input.style.borderColor = 'var(--border-color)';
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = this.collectFormData();
        
        if (!this.validateFormData(formData)) {
            return;
        }

        await this.submitToWebhook(formData);
    }

    collectFormData() {
        const token = document.getElementById('github-token').value.trim();
        
        const repoInputs = document.querySelectorAll('.repo-input');
        const repositories = Array.from(repoInputs)
            .map(input => input.value.trim())
            .filter(url => url !== '');

        return {
            githubToken: token,
            repositories: repositories,
            metadata: {
                timestamp: new Date().toISOString(),
                userAgent: 'GitHub Automation Hub v2.0',
                repositoryCount: repositories.length,
                submissionId: this.generateSubmissionId()
            }
        };
    }

    generateSubmissionId() {
        return `gah_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    validateFormData(data) {
        // Validate GitHub token
        if (!data.githubToken) {
            this.showStatusMessage('GitHub token is required', 'error');
            return false;
        }

        if (!this.isValidGitHubToken(data.githubToken)) {
            this.showStatusMessage('Invalid GitHub token format', 'error');
            return false;
        }

        // Validate repositories
        if (data.repositories.length === 0) {
            this.showStatusMessage('At least one repository is required', 'error');
            return false;
        }

        const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;
        const invalidRepos = data.repositories.filter(repo => !githubUrlPattern.test(repo));
        
        if (invalidRepos.length > 0) {
            this.showStatusMessage('Some repository URLs are invalid', 'error');
            return false;
        }

        return true;
    }

    async submitToWebhook(data) {
        const submitBtn = document.getElementById('submit-btn');
        
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            // Check if webhook URL is configured
            if (this.webhookUrl.includes('github-automation') && this.webhookUrl.includes('YOUR_WEBHOOK_ID')) {
                this.showStatusMessage(
                    '⚙️ Configuration Required: Please create a webhook in n8n and update the URL in src/scripts/main.js', 
                    'warning'
                );
                return;
            }

            // Test if the webhook URL is reachable
            console.log('Sending webhook to:', this.webhookUrl);

            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Automation-Source': 'GitHub-Automation-Hub',
                    'X-Submission-ID': data.metadata.submissionId
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Try to parse JSON response from n8n
                let responseData = {};
                try {
                    responseData = await response.json();
                } catch (e) {
                    // If response is not JSON, create a basic response object
                    responseData = {
                        success: true,
                        message: 'Automation workflow started successfully'
                    };
                }

                this.showStatusMessage(
                    `🚀 Automation started successfully! ${data.repositories.length} repository(ies) will be processed.`, 
                    'success'
                );
                
                // Log the response for debugging
                console.log('n8n Webhook Response:', responseData);
                
                // Reset form but keep token
                document.querySelectorAll('.repo-input').forEach((input, index) => {
                    if (index > 0) {
                        input.closest('.repo-input-group').remove();
                    } else {
                        input.value = '';
                    }
                });

                // Show additional success info if provided by n8n
                if (responseData.workflowId) {
                    this.showStatusMessage(`Workflow ID: ${responseData.workflowId}`, 'info');
                }
            } else {
                const errorText = await response.text();
                this.showStatusMessage(
                    `Failed to start automation: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`, 
                    'error'
                );
            }
        } catch (error) {
            console.error('Webhook submission error:', error);
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                this.showStatusMessage(
                    '🔌 Network Error: Cannot reach the webhook URL. Please check:\n' +
                    '1. The webhook URL is correct in the configuration\n' +
                    '2. The n8n workflow with webhook trigger is active\n' +
                    '3. Your internet connection is working', 
                    'error'
                );
            } else {
                this.showStatusMessage(`❌ Error: ${error.message}`, 'error');
            }
        } finally {
            // Hide loading state
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    showStatusMessage(message, type = 'info') {
        const statusContainer = document.getElementById('status-messages');
        
        const messageElement = document.createElement('div');
        messageElement.className = `status-message ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        messageElement.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
        `;
        
        statusContainer.appendChild(messageElement);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    messageElement.remove();
                }, 300);
            }
        }, 5000);
        
        // Scroll to message
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// CSS animation for slide out
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gitHubAutomationHub = new GitHubAutomationHub();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubAutomationHub;
}