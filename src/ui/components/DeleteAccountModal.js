import { BaseModal } from './BaseModal.js';

/**
 * Delete Account Modal Web Component
 * Confirms before deleting user account
 */
export class DeleteAccountModal extends BaseModal {
    constructor() {
        super();
    }

    hasCloseButton() {
        return false; // Use cancel button instead
    }

    getStyles() {
        return `
            ${super.getStyles()}

            .modal-content {
                text-align: center;
                max-width: 400px;
            }

            .delete-account-icon {
                margin-bottom: 1rem;
                color: var(--color-incorrect, #e74c3c);
            }

            .delete-account-icon svg {
                width: 48px;
                height: 48px;
            }

            h2 {
                font-family: var(--font-display, 'Playfair Display', serif);
                font-size: 1.5rem;
                margin-bottom: 0.5rem;
                color: var(--color-text, #e8e6e3);
            }

            p {
                color: var(--color-text-muted, #8892b0);
                margin-bottom: 1.5rem;
                font-size: 0.9rem;
                line-height: 1.5;
            }

            .delete-account-buttons {
                display: flex;
                gap: 0.75rem;
                justify-content: center;
            }

            .delete-account-btn {
                padding: 0.75rem 1.5rem;
                border-radius: var(--radius-md, 12px);
                font-family: var(--font-body, 'Source Sans 3', sans-serif);
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid transparent;
            }

            .delete-account-btn--cancel {
                background: var(--color-bg-card-light, #242b45);
                border-color: var(--color-border, #2a3352);
                color: var(--color-text, #e8e6e3);
            }

            .delete-account-btn--cancel:hover {
                background: var(--color-bg-card, #1a1f35);
                border-color: var(--color-text-muted, #8892b0);
            }

            .delete-account-btn--danger {
                background: var(--color-incorrect, #e74c3c);
                color: white;
            }

            .delete-account-btn--danger:hover {
                background: #c0392b;
                transform: translateY(-1px);
            }
        `;
    }

    getTemplate() {
        return `
            <div class="modal-overlay" part="overlay"></div>
            <div class="modal-content" part="content">
                <div class="delete-account-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 9v4"/>
                        <path d="M12 17h.01"/>
                        <path d="M3.586 3.586a2 2 0 0 1 2.828 0L12 9.172l5.586-5.586a2 2 0 1 1 2.828 2.828L14.828 12l5.586 5.586a2 2 0 1 1-2.828 2.828L12 14.828l-5.586 5.586a2 2 0 1 1-2.828-2.828L9.172 12 3.586 6.414a2 2 0 0 1 0-2.828z"/>
                    </svg>
                </div>
                <h2 data-i18n="deleteAccount.title">Delete Account?</h2>
                <p data-i18n="deleteAccount.message">This will permanently delete your account and all associated data. You will be able to register again with the same email. This action cannot be undone.</p>

                <div class="delete-account-buttons">
                    <button class="delete-account-btn delete-account-btn--cancel" data-action="cancel">
                        <span data-i18n="deleteAccount.cancel">Cancel</span>
                    </button>
                    <button class="delete-account-btn delete-account-btn--danger" data-action="confirm">
                        <span data-i18n="deleteAccount.confirm">Delete My Account</span>
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        super.setupEventListeners();

        this.shadowRoot.querySelector('[data-action="cancel"]').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('delete-cancel', { bubbles: true }));
            this.close();
        });

        this.shadowRoot.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('delete-confirm', { bubbles: true }));
            this.close();
        });
    }

    /**
     * Translate the modal content
     */
    translate(translateFn) {
        this.shadowRoot.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const translated = translateFn(key);
            if (translated && translated !== key) {
                el.textContent = translated;
            }
        });
    }
}

customElements.define('delete-account-modal', DeleteAccountModal);
