import { BaseModal } from './BaseModal.js';

/**
 * Profile Modal Web Component
 * Handles user profile editing with avatar upload
 */
export class ProfileModal extends BaseModal {
    constructor() {
        super();
        this._avatarData = null;
    }

    hasCloseButton() {
        return true;
    }

    getStyles() {
        return `
            ${super.getStyles()}

            .modal-content {
                max-width: 450px;
            }

            h2 {
                font-family: var(--font-display, 'Playfair Display', serif);
                font-size: 1.5rem;
                margin-bottom: 1.5rem;
                color: var(--color-text, #e8e6e3);
                padding-right: 2rem;
            }

            .profile-form {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            /* Avatar Section */
            .profile-avatar-section {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-bottom: 0.5rem;
            }

            .profile-avatar-wrapper {
                position: relative;
                width: 100px;
                height: 100px;
            }

            .profile-avatar-preview {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                object-fit: cover;
                border: 3px solid var(--color-primary, #c9a227);
            }

            .profile-avatar-preview[src=""],
            .profile-avatar-preview:not([src]) {
                display: none;
            }

            .profile-avatar-placeholder {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: var(--color-bg-card-light, #242b45);
                border: 3px dashed var(--color-border, #2a3352);
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--color-text-muted, #8892b0);
            }

            .profile-avatar-preview:not([src=""]):not(:empty) + .profile-avatar-placeholder {
                display: none;
            }

            .profile-avatar-upload {
                position: absolute;
                bottom: 0;
                right: 0;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: var(--color-primary, #c9a227);
                border: 2px solid var(--color-bg-card, #1a1f35);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                color: var(--color-bg-deep, #0f1729);
            }

            .profile-avatar-upload:hover {
                transform: scale(1.1);
            }

            .profile-avatar-hint {
                font-size: 0.75rem;
                color: var(--color-text-muted, #8892b0);
                margin-top: 0.5rem;
            }

            /* Form Fields */
            .profile-form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0.75rem;
            }

            .profile-form-group {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }

            .profile-form-group--small {
                max-width: 120px;
            }

            .profile-form-group label {
                font-size: 0.85rem;
                font-weight: 500;
                color: var(--color-text, #e8e6e3);
            }

            .required-indicator {
                color: var(--color-incorrect, #e74c3c);
                margin-left: 0.25rem;
            }

            .profile-form-group input {
                padding: 0.75rem;
                background: var(--color-bg-card-light, #242b45);
                border: 1px solid var(--color-border, #2a3352);
                border-radius: var(--radius-sm, 8px);
                color: var(--color-text, #e8e6e3);
                font-family: var(--font-body, 'Source Sans 3', sans-serif);
                font-size: 0.95rem;
                transition: border-color 0.2s ease;
            }

            .profile-form-group input:focus {
                outline: none;
                border-color: var(--color-primary, #c9a227);
            }

            .profile-form-group input::placeholder {
                color: var(--color-text-muted, #8892b0);
            }

            .profile-field-hint {
                font-size: 0.75rem;
                color: var(--color-text-muted, #8892b0);
            }

            /* Buttons */
            .profile-form-buttons {
                display: flex;
                gap: 0.75rem;
                margin-top: 0.5rem;
            }

            .profile-btn {
                flex: 1;
                padding: 0.875rem 1.5rem;
                border-radius: var(--radius-md, 12px);
                font-family: var(--font-body, 'Source Sans 3', sans-serif);
                font-size: 0.95rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
            }

            .profile-btn--save {
                background: var(--color-primary, #c9a227);
                color: var(--color-bg-deep, #0f1729);
            }

            .profile-btn--save:hover:not(:disabled) {
                background: var(--color-primary-light, #d4b23a);
                transform: translateY(-1px);
            }

            .profile-btn--save:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            /* Messages */
            .profile-message {
                padding: 0.75rem;
                border-radius: var(--radius-sm, 8px);
                font-size: 0.85rem;
                text-align: center;
                margin-top: 0.5rem;
            }

            .profile-message--error {
                background: rgba(231, 76, 60, 0.15);
                border: 1px solid rgba(231, 76, 60, 0.3);
                color: #e74c3c;
            }

            .profile-message--success {
                background: rgba(39, 174, 96, 0.15);
                border: 1px solid rgba(39, 174, 96, 0.3);
                color: #27ae60;
            }

            .profile-message[hidden] {
                display: none;
            }
        `;
    }

    getTemplate() {
        return `
            <div class="modal-overlay" part="overlay"></div>
            <div class="modal-content" part="content">
                <button class="modal-close" aria-label="Close modal" part="close">&times;</button>

                <h2 data-i18n="profile.title">Edit Profile</h2>

                <form class="profile-form" id="profile-form">
                    <!-- Avatar Section -->
                    <div class="profile-avatar-section">
                        <div class="profile-avatar-wrapper">
                            <img id="profile-avatar-preview" class="profile-avatar-preview" src="" alt="Avatar" />
                            <div id="profile-avatar-placeholder" class="profile-avatar-placeholder">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </div>
                            <label class="profile-avatar-upload" for="profile-avatar-input">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                            </label>
                            <input type="file" id="profile-avatar-input" accept="image/*" hidden />
                        </div>
                        <p class="profile-avatar-hint" data-i18n="profile.avatarHint">Max 100KB. Larger images will be compressed.</p>
                    </div>

                    <!-- Name Fields -->
                    <div class="profile-form-row">
                        <div class="profile-form-group">
                            <label for="profile-firstname" data-i18n="profile.firstName">First Name</label>
                            <input type="text" id="profile-firstname" maxlength="50" />
                        </div>
                        <div class="profile-form-group">
                            <label for="profile-lastname" data-i18n="profile.lastName">Last Name</label>
                            <input type="text" id="profile-lastname" maxlength="50" />
                        </div>
                    </div>

                    <!-- Nickname (Required) -->
                    <div class="profile-form-group">
                        <label for="profile-nickname">
                            <span data-i18n="profile.nickname">Nickname</span>
                            <span class="required-indicator">*</span>
                        </label>
                        <input type="text" id="profile-nickname" maxlength="30" required />
                        <span class="profile-field-hint" data-i18n="profile.nicknameHint">This will be displayed in the app</span>
                    </div>

                    <!-- Location -->
                    <div class="profile-form-group">
                        <label for="profile-location" data-i18n="profile.location">Location</label>
                        <input type="text" id="profile-location" maxlength="100" placeholder="City, Country" />
                    </div>

                    <!-- Age -->
                    <div class="profile-form-group profile-form-group--small">
                        <label for="profile-age" data-i18n="profile.age">Age</label>
                        <input type="number" id="profile-age" min="1" max="120" />
                    </div>

                    <!-- Buttons -->
                    <div class="profile-form-buttons">
                        <button type="submit" class="profile-btn profile-btn--save" data-i18n="profile.save">Save Changes</button>
                    </div>

                    <!-- Messages -->
                    <div id="profile-error" class="profile-message profile-message--error" hidden></div>
                    <div id="profile-success" class="profile-message profile-message--success" hidden></div>
                </form>
            </div>
        `;
    }

    setupEventListeners() {
        super.setupEventListeners();

        const form = this.shadowRoot.getElementById('profile-form');
        const avatarInput = this.shadowRoot.getElementById('profile-avatar-input');
        const avatarPreview = this.shadowRoot.getElementById('profile-avatar-preview');
        const avatarPlaceholder = this.shadowRoot.getElementById('profile-avatar-placeholder');

        // Handle avatar file selection
        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                this.dispatchEvent(new CustomEvent('avatar-selected', {
                    detail: { file },
                    bubbles: true
                }));
            }
        });

        // Handle form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.dispatchEvent(new CustomEvent('profile-submit', {
                detail: this.getFormData(),
                bubbles: true
            }));
        });
    }

    // Getters for form elements
    get avatarPreview() {
        return this.shadowRoot.getElementById('profile-avatar-preview');
    }

    get avatarPlaceholder() {
        return this.shadowRoot.getElementById('profile-avatar-placeholder');
    }

    get firstnameInput() {
        return this.shadowRoot.getElementById('profile-firstname');
    }

    get lastnameInput() {
        return this.shadowRoot.getElementById('profile-lastname');
    }

    get nicknameInput() {
        return this.shadowRoot.getElementById('profile-nickname');
    }

    get locationInput() {
        return this.shadowRoot.getElementById('profile-location');
    }

    get ageInput() {
        return this.shadowRoot.getElementById('profile-age');
    }

    get errorElement() {
        return this.shadowRoot.getElementById('profile-error');
    }

    get successElement() {
        return this.shadowRoot.getElementById('profile-success');
    }

    get saveButton() {
        return this.shadowRoot.querySelector('.profile-btn--save');
    }

    /**
     * Get all form data
     */
    getFormData() {
        return {
            firstName: this.firstnameInput.value.trim(),
            lastName: this.lastnameInput.value.trim(),
            nickname: this.nicknameInput.value.trim(),
            location: this.locationInput.value.trim(),
            age: this.ageInput.value ? parseInt(this.ageInput.value) : null,
            avatarData: this._avatarData
        };
    }

    /**
     * Set form data
     */
    setFormData(data) {
        if (data.firstName !== undefined) this.firstnameInput.value = data.firstName || '';
        if (data.lastName !== undefined) this.lastnameInput.value = data.lastName || '';
        if (data.nickname !== undefined) this.nicknameInput.value = data.nickname || '';
        if (data.location !== undefined) this.locationInput.value = data.location || '';
        if (data.age !== undefined) this.ageInput.value = data.age || '';
        if (data.avatarUrl !== undefined) {
            this.setAvatar(data.avatarUrl);
        }
    }

    /**
     * Set avatar preview
     */
    setAvatar(url) {
        const preview = this.avatarPreview;
        const placeholder = this.avatarPlaceholder;

        if (url) {
            preview.src = url;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        } else {
            preview.src = '';
            preview.style.display = 'none';
            placeholder.style.display = 'flex';
        }
    }

    /**
     * Store processed avatar data
     */
    setAvatarData(data) {
        this._avatarData = data;
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorEl = this.errorElement;
        const successEl = this.successElement;
        errorEl.textContent = message;
        errorEl.hidden = false;
        successEl.hidden = true;
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        const errorEl = this.errorElement;
        const successEl = this.successElement;
        successEl.textContent = message;
        successEl.hidden = false;
        errorEl.hidden = true;
    }

    /**
     * Hide all messages
     */
    hideMessages() {
        this.errorElement.hidden = true;
        this.successElement.hidden = true;
    }

    /**
     * Set save button loading state
     */
    setSaving(isSaving) {
        const btn = this.saveButton;
        btn.disabled = isSaving;
        btn.textContent = isSaving ? 'Saving...' : 'Save Changes';
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

    /**
     * Reset form and close
     */
    close() {
        this.hideMessages();
        this._avatarData = null;
        super.close();
    }
}

customElements.define('profile-modal', ProfileModal);
