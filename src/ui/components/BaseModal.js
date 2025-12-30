/**
 * Base Modal Web Component
 * Provides common modal functionality: show/hide, overlay, close button, accessibility
 */
export class BaseModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._isOpen = false;
    }

    static get observedAttributes() {
        return ['open'];
    }

    get open() {
        return this._isOpen;
    }

    set open(value) {
        const isOpen = Boolean(value);
        if (this._isOpen !== isOpen) {
            this._isOpen = isOpen;
            if (isOpen) {
                this.removeAttribute('hidden');
                this.setAttribute('open', '');
            } else {
                this.setAttribute('hidden', '');
                this.removeAttribute('open');
            }
            this.dispatchEvent(new CustomEvent(isOpen ? 'modal-open' : 'modal-close', { bubbles: true }));
        }
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();

        // Initialize hidden state
        if (!this.hasAttribute('open')) {
            this.setAttribute('hidden', '');
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'open') {
            this._isOpen = newValue !== null;
        }
    }

    getStyles() {
        return `
            :host {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
            }

            :host([hidden]) {
                display: none;
            }

            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
                cursor: pointer;
                z-index: 1;
            }

            .modal-content {
                position: relative;
                z-index: 2;
                background: var(--color-bg-card, #1a1f35);
                border-radius: var(--radius-lg, 16px);
                padding: 1.5rem;
                max-width: 500px;
                width: 100%;
                max-height: 80vh;
                overflow-x: visible;
                overflow-y: auto;
                border: 1px solid var(--color-border, #2a3352);
                box-shadow: var(--shadow-soft, 0 4px 20px rgba(0, 0, 0, 0.3));
                animation: modalSlideIn 0.3s ease;
            }

            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .modal-close {
                position: absolute;
                top: 1rem;
                right: 1rem;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: var(--color-bg-card-light, #242b45);
                border: 1px solid var(--color-border, #2a3352);
                color: var(--color-text-muted, #8892b0);
                font-size: 1.25rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                z-index: 10;
            }

            .modal-close:hover {
                background: rgba(231, 76, 60, 0.2);
                border-color: #e74c3c;
                color: #e74c3c;
            }

            ::slotted(*) {
                color: var(--color-text, #e8e6e3);
            }
        `;
    }

    getTemplate() {
        return `
            <div class="modal-overlay" part="overlay"></div>
            <div class="modal-content" part="content">
                ${this.hasCloseButton() ? '<button class="modal-close" aria-label="Close modal" part="close">&times;</button>' : ''}
                <slot></slot>
            </div>
        `;
    }

    hasCloseButton() {
        return true;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>${this.getStyles()}</style>
            ${this.getTemplate()}
        `;
    }

    setupEventListeners() {
        // Close on overlay click
        const overlay = this.shadowRoot.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.close());
        }

        // Close on close button click
        const closeBtn = this.shadowRoot.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Close on Escape key
        this.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.open) {
                this.close();
            }
        });
    }

    show() {
        this.open = true;
    }

    close() {
        this.open = false;
    }

    toggle() {
        this.open = !this.open;
    }
}

// Don't auto-register - let specific modals extend this
