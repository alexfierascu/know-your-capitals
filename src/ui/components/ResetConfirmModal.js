import { BaseModal } from './BaseModal.js';

/**
 * Reset Confirmation Modal Web Component
 * Confirms before resetting all user progress
 */
export class ResetConfirmModal extends BaseModal {
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

            .reset-confirm-icon {
                margin-bottom: 1rem;
                color: var(--color-incorrect, #e74c3c);
            }

            .reset-confirm-icon svg {
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

            .reset-confirm-buttons {
                display: flex;
                gap: 0.75rem;
                justify-content: center;
            }

            .reset-confirm-btn {
                padding: 0.75rem 1.5rem;
                border-radius: var(--radius-md, 12px);
                font-family: var(--font-body, 'Source Sans 3', sans-serif);
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid transparent;
            }

            .reset-confirm-btn--cancel {
                background: var(--color-bg-card-light, #242b45);
                border-color: var(--color-border, #2a3352);
                color: var(--color-text, #e8e6e3);
            }

            .reset-confirm-btn--cancel:hover {
                background: var(--color-bg-card, #1a1f35);
                border-color: var(--color-text-muted, #8892b0);
            }

            .reset-confirm-btn--danger {
                background: var(--color-incorrect, #e74c3c);
                color: white;
            }

            .reset-confirm-btn--danger:hover {
                background: #c0392b;
                transform: translateY(-1px);
            }
        `;
    }

    getTemplate() {
        return `
            <div class="modal-overlay" part="overlay"></div>
            <div class="modal-content" part="content">
                <div class="reset-confirm-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 9v4"/>
                        <path d="M12 17h.01"/>
                        <path d="M3.262 13.424a9.969 9.969 0 0 0 1.476 3.312A10 10 0 1 0 12 2c-2.373 0-4.548.827-6.262 2.212"/>
                        <path d="M7 9l-4-1"/>
                        <path d="M3 8v5h5"/>
                    </svg>
                </div>
                <h2 data-i18n="reset.title">Reset Progress?</h2>
                <p data-i18n="reset.message">This will permanently delete all your progress, achievements, and leaderboard scores. This action cannot be undone.</p>

                <div class="reset-confirm-buttons">
                    <button class="reset-confirm-btn reset-confirm-btn--cancel" data-action="cancel">
                        <span data-i18n="reset.cancel">Cancel</span>
                    </button>
                    <button class="reset-confirm-btn reset-confirm-btn--danger" data-action="confirm">
                        <span data-i18n="reset.confirm">Reset Everything</span>
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        super.setupEventListeners();

        this.shadowRoot.querySelector('[data-action="cancel"]').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('reset-cancel', { bubbles: true }));
            this.close();
        });

        this.shadowRoot.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('reset-confirm', { bubbles: true }));
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

customElements.define('reset-confirm-modal', ResetConfirmModal);
