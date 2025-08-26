// Form Component - Enhanced Form Interactions and Utilities
class FormComponent {
    constructor() {
        this.init();
    }

    init() {
        this.addFormEnhancements();
        this.addKeyboardShortcuts();
        this.addFormValidationEnhancements();
    }

    addFormEnhancements() {
        // Add floating labels effect
        this.addFloatingLabels();
        
        // Add form auto-save
        this.addAutoSave();
        
        // Add copy/paste functionality for repository URLs
        this.addCopyPasteFunctionality();
    }

    addFloatingLabels() {
        const inputs = document.querySelectorAll('.form-input');
        
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.classList.remove('focused');
                }
            });
            
            // Check for pre-filled values
            if (input.value) {
                input.classList.add('focused');
            }
        });
    }

    addAutoSave() {
        const form = document.getElementById('github-form');
        let autoSaveTimeout;
        
        form.addEventListener('input', () => {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                this.saveFormState();
            }, 1000); // Auto-save after 1 second of inactivity
        });
        
        // Load saved state on page load
        this.loadFormState();
    }

    saveFormState() {
        const formData = {
            repositories: Array.from(document.querySelectorAll('.repo-input'))
                .map(input => input.value)
                .filter(value => value.trim() !== '')
        };
        
        localStorage.setItem('github_automation_form_state', JSON.stringify(formData));
    }

    loadFormState() {
        const savedState = localStorage.getItem('github_automation_form_state');
        
        if (savedState) {
            try {
                const formData = JSON.parse(savedState);
                
                // Restore repositories
                if (formData.repositories && formData.repositories.length > 1) {
                    const repoContainer = document.getElementById('repo-container');
                    const firstRepoInput = repoContainer.querySelector('.repo-input');
                    
                    // Set first repository
                    if (formData.repositories[0]) {
                        firstRepoInput.value = formData.repositories[0];
                    }
                    
                    // Add additional repositories
                    for (let i = 1; i < formData.repositories.length; i++) {
                        this.addRepositoryFieldWithValue(formData.repositories[i]);
                    }
                }
            } catch (error) {
                console.warn('Failed to load form state:', error);
            }
        }
    }

    addRepositoryFieldWithValue(value) {
        const repoContainer = document.getElementById('repo-container');
        const repoInputGroup = document.createElement('div');
        repoInputGroup.className = 'repo-input-group';
        repoInputGroup.innerHTML = `
            <div class="input-wrapper">
                <input 
                    type="text" 
                    name="repo-url" 
                    placeholder="https://github.com/username/repository"
                    class="form-input repo-input"
                    value="${value}"
                    required
                >
                <button type="button" class="remove-repo-btn" title="Remove repository">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        repoContainer.appendChild(repoInputGroup);
    }

    addCopyPasteFunctionality() {
        // Add context menu for repository inputs
        document.addEventListener('contextmenu', (e) => {
            if (e.target.classList.contains('repo-input')) {
                e.preventDefault();
                this.showRepositoryContextMenu(e);
            }
        });

        // Handle paste events for multiple URLs
        document.addEventListener('paste', (e) => {
            if (e.target.classList.contains('repo-input')) {
                setTimeout(() => {
                    this.handleMultipleRepositoryPaste(e.target);
                }, 10);
            }
        });
    }

    showRepositoryContextMenu(event) {
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" data-action="paste-multiple">
                <i class="fas fa-paste"></i>
                Paste Multiple URLs
            </div>
            <div class="context-menu-item" data-action="clear-all">
                <i class="fas fa-trash"></i>
                Clear All Repositories
            </div>
        `;

        menu.style.position = 'fixed';
        menu.style.left = event.clientX + 'px';
        menu.style.top = event.clientY + 'px';
        menu.style.zIndex = '1000';

        document.body.appendChild(menu);

        // Handle menu clicks
        menu.addEventListener('click', (e) => {
            const action = e.target.closest('.context-menu-item')?.dataset.action;
            
            if (action === 'paste-multiple') {
                this.showPasteDialog();
            } else if (action === 'clear-all') {
                this.clearAllRepositories();
            }
            
            menu.remove();
        });

        // Remove menu on outside click
        setTimeout(() => {
            document.addEventListener('click', () => {
                menu.remove();
            }, { once: true });
        }, 10);
    }

    showPasteDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'paste-dialog-overlay';
        dialog.innerHTML = `
            <div class="paste-dialog">
                <div class="paste-dialog-header">
                    <h3><i class="fas fa-paste"></i> Paste Multiple Repository URLs</h3>
                    <button class="close-dialog" aria-label="Close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="paste-dialog-content">
                    <p>Paste multiple GitHub repository URLs (one per line):</p>
                    <textarea 
                        id="multi-repo-input" 
                        placeholder="https://github.com/user/repo1&#10;https://github.com/user/repo2&#10;https://github.com/user/repo3"
                        rows="6"
                    ></textarea>
                </div>
                <div class="paste-dialog-actions">
                    <button class="btn-secondary cancel-paste">Cancel</button>
                    <button class="btn-primary confirm-paste">Add Repositories</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Handle dialog actions
        dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.remove());
        dialog.querySelector('.cancel-paste').addEventListener('click', () => dialog.remove());
        dialog.querySelector('.confirm-paste').addEventListener('click', () => {
            const textarea = dialog.querySelector('#multi-repo-input');
            this.processMultipleRepositories(textarea.value);
            dialog.remove();
        });

        // Focus textarea
        dialog.querySelector('#multi-repo-input').focus();
    }

    handleMultipleRepositoryPaste(targetInput) {
        const value = targetInput.value;
        const lines = value.split('\n').filter(line => line.trim());
        
        if (lines.length > 1) {
            targetInput.value = lines[0];
            this.processMultipleRepositories(lines.slice(1).join('\n'));
        }
    }

    processMultipleRepositories(text) {
        const urls = text.split('\n')
            .map(line => line.trim())
            .filter(line => line && line.startsWith('https://github.com/'));

        if (urls.length === 0) {
            this.showMessage('No valid GitHub URLs found', 'warning');
            return;
        }

        const repoContainer = document.getElementById('repo-container');
        const currentRepos = repoContainer.children.length;
        const maxRepos = 10;
        const availableSlots = maxRepos - currentRepos;

        if (urls.length > availableSlots) {
            this.showMessage(`Can only add ${availableSlots} more repositories (max 10 total)`, 'warning');
            urls.splice(availableSlots);
        }

        urls.forEach(url => {
            this.addRepositoryFieldWithValue(url);
        });

        this.showMessage(`Added ${urls.length} repository(ies)`, 'success');
    }

    clearAllRepositories() {
        if (confirm('Are you sure you want to clear all repositories?')) {
            const repoContainer = document.getElementById('repo-container');
            
            // Clear all repository inputs
            repoContainer.innerHTML = `
                <div class="repo-input-group">
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
                </div>
            `;
            
            this.showMessage('All repositories cleared', 'info');
        }
    }

    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to submit form
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('github-form').requestSubmit();
            }
            
            // Ctrl/Cmd + Shift + R to add repository
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                document.getElementById('add-repo').click();
            }
            
            // Escape to clear focus
            if (e.key === 'Escape') {
                document.activeElement?.blur();
            }
        });
    }

    addFormValidationEnhancements() {
        // Real-time validation feedback
        const inputs = document.querySelectorAll('.form-input');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateInput(input);
            });
            
            input.addEventListener('input', () => {
                // Clear validation state on input
                input.classList.remove('invalid', 'valid');
            });
        });
    }

    validateInput(input) {
        const value = input.value.trim();
        
        if (input.id === 'github-token') {
            const isValid = this.isValidGitHubToken(value);
            input.classList.toggle('invalid', value && !isValid);
            input.classList.toggle('valid', value && isValid);
        } else if (input.classList.contains('repo-input')) {
            const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;
            const isValid = githubUrlPattern.test(value);
            input.classList.toggle('invalid', value && !isValid);
            input.classList.toggle('valid', value && isValid);
        }
    }

    isValidGitHubToken(token) {
        const tokenPatterns = [
            /^ghp_[a-zA-Z0-9]{36}$/,
            /^ghs_[a-zA-Z0-9]{36}$/,
            /^gho_[a-zA-Z0-9]{36}$/,
            /^github_pat_[a-zA-Z0-9_]{82}$/
        ];
        
        return tokenPatterns.some(pattern => pattern.test(token));
    }

    showMessage(message, type) {
        // This method integrates with the main app's message system
        if (window.gitHubAutomationHub) {
            window.gitHubAutomationHub.showStatusMessage(message, type);
        }
    }
}

// CSS for additional components
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .context-menu {
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        min-width: 200px;
        padding: 0.5rem 0;
    }

    .context-menu-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        cursor: pointer;
        transition: var(--transition);
        color: var(--text-primary);
    }

    .context-menu-item:hover {
        background: var(--accent-blue);
        color: white;
    }

    .paste-dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(5px);
    }

    .paste-dialog {
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: var(--shadow-lg);
    }

    .paste-dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--border-color);
    }

    .paste-dialog-header h3 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-primary);
    }

    .close-dialog {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 4px;
        transition: var(--transition);
    }

    .close-dialog:hover {
        color: var(--accent-red);
        background: rgba(255, 123, 114, 0.1);
    }

    .paste-dialog-content {
        padding: 1.5rem;
    }

    .paste-dialog-content p {
        margin-bottom: 1rem;
        color: var(--text-secondary);
    }

    .paste-dialog-content textarea {
        width: 100%;
        min-height: 120px;
        padding: 1rem;
        background: var(--secondary-bg);
        border: 2px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-primary);
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.875rem;
        resize: vertical;
        transition: var(--transition);
    }

    .paste-dialog-content textarea:focus {
        outline: none;
        border-color: var(--accent-blue);
        box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
    }

    .paste-dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        padding: 1.5rem;
        border-top: 1px solid var(--border-color);
    }

    .btn-secondary, .btn-primary {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: var(--transition);
    }

    .btn-secondary {
        background: var(--secondary-bg);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
    }

    .btn-secondary:hover {
        background: var(--border-color);
    }

    .btn-primary {
        background: var(--accent-blue);
        color: white;
    }

    .btn-primary:hover {
        background: #4493f8;
        transform: translateY(-1px);
    }

    .form-input.valid {
        border-color: var(--accent-green);
    }

    .form-input.invalid {
        border-color: var(--accent-red);
    }

    .form-input.focused {
        transform: scale(1.01);
    }
`;

document.head.appendChild(additionalStyles);

// Initialize form component when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.formComponent = new FormComponent();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormComponent;
}