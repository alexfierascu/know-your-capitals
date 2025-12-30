import { BaseModal } from './BaseModal.js';

/**
 * Migration Modal Web Component
 * Handles data migration choices when local and cloud data conflict
 */
export class MigrationModal extends BaseModal {
    constructor() {
        super();
    }

    hasCloseButton() {
        return false; // No close button - user must make a choice
    }

    getStyles() {
        return `
            ${super.getStyles()}

            .modal-content {
                text-align: center;
            }

            .migration-icon {
                margin-bottom: 1rem;
                color: var(--color-primary, #c9a227);
            }

            .migration-icon svg {
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
            }

            .migration-options {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .migration-option {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                background: var(--color-bg-card-light, #242b45);
                border: 1px solid var(--color-border, #2a3352);
                border-radius: var(--radius-md, 12px);
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: left;
                color: var(--color-text, #e8e6e3);
                font-family: var(--font-body, 'Source Sans 3', sans-serif);
            }

            .migration-option:hover {
                border-color: var(--color-primary, #c9a227);
                background: rgba(201, 162, 39, 0.1);
            }

            .migration-option.recommended {
                border-color: var(--color-primary, #c9a227);
                background: rgba(201, 162, 39, 0.1);
            }

            .migration-option-icon {
                font-size: 1.5rem;
                flex-shrink: 0;
            }

            .migration-option-text {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }

            .migration-option-text strong {
                font-size: 0.95rem;
            }

            .migration-option-text span {
                font-size: 0.8rem;
                color: var(--color-text-muted, #8892b0);
            }
        `;
    }

    getTemplate() {
        return `
            <div class="modal-overlay" part="overlay"></div>
            <div class="modal-content" part="content">
                <div class="migration-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                </div>
                <h2 data-i18n="migration.title">Data Found</h2>
                <p data-i18n="migration.message">We found existing progress data. What would you like to do?</p>

                <div class="migration-options">
                    <button class="migration-option" data-action="cloud">
                        <div class="migration-option-icon">☁️</div>
                        <div class="migration-option-text">
                            <strong data-i18n="migration.useCloud">Use Cloud Data</strong>
                            <span data-i18n="migration.useCloudDesc">Keep your synced progress, discard local data</span>
                        </div>
                    </button>
                    <button class="migration-option" data-action="local">
                        <div class="migration-option-icon">💾</div>
                        <div class="migration-option-text">
                            <strong data-i18n="migration.useLocal">Use Local Data</strong>
                            <span data-i18n="migration.useLocalDesc">Keep this device's progress, replace cloud data</span>
                        </div>
                    </button>
                    <button class="migration-option recommended" data-action="merge">
                        <div class="migration-option-icon">🔄</div>
                        <div class="migration-option-text">
                            <strong data-i18n="migration.merge">Merge Both</strong>
                            <span data-i18n="migration.mergeDesc">Combine local and cloud progress (Recommended)</span>
                        </div>
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        super.setupEventListeners();

        // Handle option button clicks
        this.shadowRoot.querySelectorAll('.migration-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.dispatchEvent(new CustomEvent('migration-choice', {
                    detail: { choice: action },
                    bubbles: true
                }));
                this.close();
            });
        });
    }

    /**
     * Translate the modal content using the provided translate function
     * @param {Function} translateFn - Function that takes an i18n key and returns translated text
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

customElements.define('migration-modal', MigrationModal);
