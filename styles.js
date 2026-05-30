// 1. Base Styles (Container, Home Screen, Shared Buttons)
const baseStyles=`

/* Main Container */
.andro-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background-color: var(--primary-color);
    color: var(--primary-text-color);
    font-family: sans-serif;
    overflow: hidden;
}

.open-file-list li.tile .file,
.open-file-list li.tile .aid-builder-icon {
    background-size: 13px;
}

/* Center Content Wrapper (For Home Screen) */
.andro-home-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    padding: 20px;
    text-align: center;
}

/* Typography */
.andro-heading {
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 20px;
    color: var(--popup-text-color);
    letter-spacing: 1px;
}

.andro-title {
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 5px;
    color: var(--primary-text-color);
}

.andro-subtitle {
    font-size: 0.9rem;
    opacity: 0.7;
    margin-bottom: 40px;
    color: var(--primary-text-color);
}

/* Robot Image */
.andro-logo {
    width: 120px;
    height: 120px;
    margin-bottom: 25px;
    object-fit: contain;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
}

/* Button Group */
.andro-btn-group {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
    max-width: 300px;
}

/* Shared Buttons */
.andro-btn {
    background-color: var(--secondary-color);
    color: var(--primary-text-color);
    border: 1px solid var(--border-color);
    padding: 12px 20px;
    border-radius: 1px;
    /* Client Preference */
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    outline: none;
    display: flex;
    align-items: center;
    justify-content: center;
}

.andro-btn:active {
    background-color: var(--button-active-color);
    transform: scale(0.98);
    border-color: var(--popup-active-color);
}

`;

// 2. Create Project Page (Layout & Header)
const createPageStyles=` .andro-create-page {
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: 100%;
    overflow: hidden;
}

.andro-create-title {
    font-size: 1.5rem;
    color: var(--popup-active-color);
    margin-bottom: 20px;
}

.andro-create-header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-bottom: 15px;
}

.back-btn {
    margin-top: 20px;
    background: transparent;
    border: none;
    color: var(--primary-text-color);
    opacity: 0.6;
    text-decoration: underline;
    cursor: pointer;
    padding: 10px;
}

/* Footer Back Button Positioning */
.back-btn {
    margin-top: auto;
    margin-bottom: 20px;
    position: fixed;
    bottom: 0;
}

`;

// 3. Grid System (Templates)
const gridStyles=` .andro-template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 20px;
    width: 100%;
    max-width: 800px;
    padding: 10px;
    margin-bottom: 30px;
    overflow: scroll;
}

.andro-template-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--secondary-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 15px;
    cursor: pointer;
    transition: transform 0.2s, border-color 0.2s;
    aspect-ratio: 1/1.4;
    height: 130px;

    background: none;
    border: none;
}

.andro-template-card:active {
    border-color: var(--popup-active-color);
    background-color: var(--button-active-color);
    transform: scale(0.95);
}

.andro-template-img {
    width: 100%;
    max-width: 70px;
    height: auto;
    object-fit: cover;
    margin-bottom: 12px;
    flex-grow: 1;
}

.andro-template-name {
    font-size: 0.85rem;
    text-align: center;
    color: var(--primary-text-color);
    font-weight: 500;
    line-height: 1.3;
    word-break: break-word;
}

`;

// 4. Configuration Form Styles (Inputs, Labels)
const configPageStyles=` .andro-config-page {
    padding: 20px;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}

.andro-form-group {
    margin-bottom: 20px;
    width: 100%;
}

.andro-label {
    display: block;
    margin-bottom: 8px;
    font-size: 0.85rem;
    color: var(--primary-text-color);
    font-weight: 600;
    opacity: 0.9;
}

.andro-input {
    width: 100%;
    padding: 12px;
    background-color: var(--secondary-color);
    border-radius: 1px;
    /* Client Preference */
    color: var(--primary-text-color);
    font-size: 1rem;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s;
    height: 33px;
    /* Specific Height */
    border: none;
    background: var(--primary-color);
    border-bottom: 0.5px solid grey;
}

.andro-input:focus {
    border-color: var(--popup-active-color);
}

/* Location Input Row */
.andro-input-row {
    display: flex;
    gap: 10px;
    align-items: stretch;
    width: 100%;
}

.andro-input-row .andro-input {
    flex-grow: 1;
}

.andro-icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--secondary-color);
    border: 1px solid var(--border-color);
    color: var(--primary-text-color);
    border-radius: 2px;
    /* Client Preference */
    padding: 0 15px;
    cursor: pointer;
    min-width: 50px;
    transition: background 0.2s;
    border: none;
    background: var(--primary-color);
    border-bottom: 0.5px solid grey;
}

.andro-icon-btn:active {
    background-color: var(--button-active-color);
    border-color: var(--popup-active-color);
}

`;

// 5. Dropdown Styles (Custom Select)
const dropdownStyles=` .custom-select-container {
    position: relative;
    width: 100%;
    user-select: none;
}

.custom-select-trigger {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--secondary-color);
    border: 1px solid var(--border-color);
    padding: 12px;
    border-radius: 0;
    /* Client Preference */
    cursor: pointer;
    font-size: 1rem;
    color: var(--primary-text-color);
    height: 9px;
    /* Specific Height */
    border: none;
    background: var(--primary-color);
    border-bottom: 0.5px solid grey;
}

.custom-select-trigger:active,
.custom-select-trigger.active {
    border-color: var(--popup-active-color);
}

.custom-select-options {
    position: absolute;
    top: 105%;
    left: 0;
    right: 0;
    background-color: var(--secondary-color);
    border: 1px solid var(--border-color);
    border-radius: 2px;
    /* Client Preference */
    z-index: 100;
    max-height: 200px;
    overflow-y: auto;
    display: none;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.custom-select-options.open {
    display: block;
}

.custom-option {
    padding: 12px;
    cursor: pointer;
    transition: background 0.2s;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    height: 9px;
    /* Specific Height */
}

.custom-option:last-child {
    border-bottom: none;
}

.custom-option:hover {
    background-color: var(--button-active-color);
}

.custom-option.selected {
    background-color: var(--popup-active-color);
    color: #fff;
}

`;

// 6. Action Bar / Footer Styles
const footerStyles=` .andro-action-bar {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
}

.andro-btn {
    padding: 10px 20px;
    border-radius: 2px;
    /* Client Preference */
    cursor: pointer;
    font-weight: 500;
}

.andro-btn-secondary {
    background: transparent;
    color: var(--primary-text-color);
    border: 1px solid var(--border-color);
}

#btnFinish {
    background: rgb(15, 104, 15);
    padding: 0px 60px;
    color: white;
    border: none;

}

`;

// Add this to your styles.js
const resultPageStyles=`

/* Result Page Container */
.andro-result-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: 20px;
    animation: fadeIn 0.5s ease;
}

/* Success/Error Icon */
.andro-result-icon {
    margin: 20px 0;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

/* Build Info Card */
.andro-build-info {
    background-color: var(--secondary-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 15px;
    width: 100%;
    max-width: 400px;
    margin-bottom: 20px;
    text-align: left;
    font-family: monospace;
    font-size: 0.85rem;
    color: var(--primary-text-color);
}

.andro-info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding-bottom: 4px;
}

.andro-info-row:last-child {
    border-bottom: none;
}

.andro-info-label {
    opacity: 0.7;
}

.andro-info-val {
    font-weight: 600;
    color: var(--popup-active-color);
}

/* Messages */
.andro-result-msg {
    font-size: 1.1rem;
    margin-bottom: 10px;
    color: var(--primary-text-color);
}

.andro-close-msg {
    font-style: italic;
    opacity: 0.6;
    font-size: 0.9rem;
    margin-top: 20px;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

`;

const wizardStyles=`

/* Wizard Container */
.andro-wizard-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--primary-color);
    color: var(--primary-text-color);
    font-family: sans-serif;
    padding: 0;
}

/* Wizard Header */
.andro-wizard-header {
    padding: 15px 20px;
    background-color: var(--secondary-color);
    border-bottom: 1px solid var(--border-color);
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--primary-text-color);
    display: flex;
    align-items: center;
    gap: 10px;
}

/* Wizard Body */
.andro-wizard-body {
    flex-grow: 1;
    padding: 30px 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    overflow-y: auto;
}

.andro-wizard-title {
    font-size: 1.6rem;
    color: var(--primary-text-color);
    margin-bottom: 15px;
    font-weight: bold;
}

.andro-wizard-text {
    font-size: 0.95rem;
    line-height: 1.5;
    max-width: 600px;
    margin-bottom: 30px;
    color: var(--secondary-text-color);
}

/* Setup List Box */
.andro-setup-list {
    width: 100%;
    max-width: 500px;
    background-color: var(--secondary-color);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 15px;
    text-align: left;
    height: auto;
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Setup Item */
.andro-setup-item {
    display: flex;
    justify-content: space-between;
    padding: 6px 5px;
    font-size: 0.9rem;
    color: var(--primary-text-color);
}

.andro-setup-size {
    color: var(--secondary-text-color);
    font-size: 0.85rem;
}

/* Separator */
.andro-list-separator {
    height: 1px;
    background-color: var(--border-color);
    margin: 10px 0;
    opacity: 0.6;
}

/* Progress Bar Area */
.andro-progress-area {
    width: 100%;
    max-width: 500px;
    text-align: left;
}

.andro-progress-label {
    margin-bottom: 5px;
    font-size: 0.9rem;
    color: var(--primary-text-color);
    font-weight: 600;
}

.andro-progress-sub {
    font-size: 0.8rem;
    color: var(--secondary-text-color);
    margin-bottom: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Progress Track & Fill */
.andro-progress-track {
    width: 100%;
    height: 6px;
    background-color: var(--border-color);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 15px;
}

.andro-progress-fill {
    height: 100%;
    background-color: #2196F3;
    /* Fixed Blue */
    width: 0%;
    transition: width 0.3s ease;
}

/* Details Log */
.andro-details-box {
    width: 100%;
    height: 150px;
    background-color: var(--secondary-color);
    color: var(--text-color);
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    padding: 10px;
    overflow-y: auto;
    border: 1px solid var(--border-color);
    display: none;
    margin-top: 10px;
    border-radius: 4px;
    white-space: pre-wrap;
    word-break: break-all;
}

/* Footer Buttons */
.andro-wizard-footer {
    padding: 15px 20px;
    border-top: 1px solid var(--border-color);
    background-color: var(--primary-color);
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.andro-wiz-btn {
    padding: 8px 18px;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    border: 1px solid transparent;
    transition: opacity 0.2s;
}

.btn-secondary {
    background: transparent;
    color: var(--secondary-text-color);
    border: 1px solid var(--border-color);
}

.btn-secondary:hover {
    color: var(--primary-text-color);
    border-color: var(--primary-text-color);
}

.btn-primary {
    background-color: var(--button-background-color, #4a88c7);
    color: var(--button-text-color, #ffffff);
    font-weight: 600;
}

.btn-primary:hover {
    opacity: 0.9;
}

.btn-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: var(--border-color);
    color: var(--secondary-text-color);
}

`;

const buildStyles=`

/* Full Page Container */
.andro-build-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background-color: var(--primary-color);
    color: var(--primary-text-color);
    font-family: sans-serif;
    overflow: hidden;
}

/* Header (Name & Download Button) */
.andro-build-header-sec {
    padding: 10px 15px;
    background-color: var(--secondary-color);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 20px;
}

.build-app-name {
    font-weight: bold;
    font-size: 1rem;
    color: var(--primary-text-color);
    display: flex;
    align-items: center;
    gap: 8px;
}

.thin-download-btn {
    background-color: rgb(19, 99, 22);
    color: white;
    border: none;
    padding: 6px 15px;
    border-radius: 1px;
    font-size: 0.8rem;
    cursor: pointer;
    display: none;
    /* Hidden initially */
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.thin-download-btn:hover {
    background-color: #43a047;
}

.thin-download-btn:active {
    transform: scale(0.95);
}

/* Main Body (Centered) */
.andro-build-body {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 20px;
    text-align: center;
    overflow-y: scroll;
    overflow-x: hidden;
}

.build-logo-large {
    width: 180px;
    margin: 0;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
    opacity: 0.9;
    object-fit: cover;
    object-position: 0px -37px;
    height: 53px;
}

.build-logo-gif {
    width: 50px;
    margin-bottom: 20px;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
    opacity: 0.9;
}

.build-main-status {
    font-size: 1.4rem;
    font-weight: 300;
    margin-bottom: 10px;
    color: var(--primary-text-color);
}

/* Progress Area */
.build-progress-wrapper {
    width: 100%;
    max-width: 450px;
    margin-top: 20px;
    text-align: left;
}

.build-sub-status {
    font-size: 0.85rem;
    color: #999;
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: monospace;
    min-height: 1.2em;
}

.andro-build-track {
    height: 6px;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
}

.andro-build-bar {
    height: 100%;
    width: 0%;
    background-color: #fff;
    /* Starting Blue */
    transition: width 0.3s ease, background-color 0.5s ease;
}

/* Details Button */
.btn-show-details {
    background: transparent;
    border: 1px solid var(--border-color);
    color: #bbb;
    padding: 5px 12px;
    font-size: 0.75rem;
    border-radius: 15px;
    margin-top: 15px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-show-details:hover {
    background-color: rgba(255, 255, 255, 0.05);
}

#btn-stop:hover {
    background-color: rgba(244, 67, 54, 0.1);
}

/* Log Box - Ensure New Lines */
.build-details-box {
    width: 100%;
    max-width: 500px;
    max-height: 330px;
    min-height: 200px;
    height: 330px;
    background-color: #1e1e1e;
    color: #a9b7c6;
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    padding: 10px;
    overflow-y: auto;
    border: 1px solid #333;
    border-radius: 4px;
    margin-top: 15px;
    display: none;
    text-align: left;
    white-space: pre-wrap;
    /* ✅ This fixes the new line issue */
    word-break: break-all;
    user-select: text;
}

/* Footer Info */
.build-path-info {
    margin-top: auto;
    /* Push to bottom */
    padding: 15px;
    font-size: 0.8rem;
    color: #888;
    font-style: italic;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    width: 100%;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
}

.after-build-informmation {
    color: rgb(52, 141, 193);
    font-size: 11px;
    font-style: italic;
    margin-top: 12px;
}

`;

const imageGenStyles=`

/* Large Top Image */
.camera-logo-large {
    margin: 0;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
    opacity: 0.9;
    object-fit: cover;
    object-position: 0px -37px;
    height: 53px;
    object-fit: cover;
    margin-bottom: 10px;
    aspect-ratio: 16 / 9;
    width: 261px;
    height: 107px;
}

/* Project ID Badge */
.project-id-badge {
    font-size: 0.75rem;
    background-color: rgba(255, 255, 255, 0.1);
    padding: 2px 8px;
    border-radius: 4px;
    color: #aaa;
    margin-left: 10px;
    font-family: monospace;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Config Card */
.icon-config-card {
    background-color: var(--secondary-color);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 20px;
    width: 100%;
    max-width: 450px;
    margin-top: 20px;
    text-align: left;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Preview Section Layout */
.preview-section {
    display: flex;
    gap: 20px;
    align-items: center;
    margin-bottom: 20px;
}

.icon-preview-box {
    width: 80px;
    height: 80px;
    background: #333;
    border-radius: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed #555;
    overflow: hidden;
    position: relative;
    flex-shrink: 0;
}

.preview-placeholder {
    opacity: 0.5;
    font-size: 0.7rem;
}

.preview-img-element {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: none;
}

/* Input Area */
.input-area {
    flex-grow: 1;
}

.input-row {
    display: flex;
    gap: 5px;
}

.input-path-field {
    font-size: 0.85rem;
    padding: 8px;
}

/* Meta Data (Size & Dims) */
.icon-meta-info {
    margin-top: 8px;
    display: none;
    /* Hidden initially */
}

.meta-tag {
    font-size: 0.75rem;
    font-family: monospace;
    padding: 2px 6px;
    border-radius: 3px;
    margin-right: 5px;
}

.meta-dim {
    color: #4CAF50;
    background: rgba(76, 175, 80, 0.1);
    border: 1px solid rgba(76, 175, 80, 0.2);
}

.meta-size {
    color: #2196F3;
    background: rgba(33, 150, 243, 0.1);
    border: 1px solid rgba(33, 150, 243, 0.2);
}

/* Divider */
.card-divider {
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    margin: 15px 0;
}

/* File List (Tree View) */
.gen-file-list {
    margin-top: 15px;
    background: rgba(0, 0, 0, 0.2);
    padding: 10px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.8rem;
    color: #81C784;
    /* Dark Greenish */
    display: none;
    /* Hidden initially */
    max-height: 150px;
    overflow-y: auto;
    border: 1px solid rgba(76, 175, 80, 0.2);
}

.tree-root {
    opacity: 0.7;
    color: #fff;
    margin-bottom: 5px;
}

.tree-parent {
    margin-left: 10px;
    color: #AED581;
    display: flex;
    gap: 5px;
    flex-direction: row;
    align-items: center;
}

.tree-child {
    margin-left: 25px;
    opacity: 0.9;
    display: block;
    display: flex;
    gap: 5px;
    flex-direction: row;
    align-items: center;
}

/* Progress Bar (Premium Look) */
.gen-progress-wrapper {
    width: 100%;
    margin-top: 15px;
    display: none;
    /* Hidden initially */
}

.gen-progress-track {
    height: 6px;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
}

.gen-progress-bar {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, #4CAF50, #8BC34A);
    transition: width 0.2s ease;
    box-shadow: 0 0 10px rgba(76, 175, 80, 0.4);
}

.gen-status-text {
    font-size: 0.8rem;
    color: #aaa;
    margin-top: 5px;
    text-align: center;
    font-style: italic;
}

/* Info Text */
.info-text {
    font-size: 0.8rem;
    color: #888;
    line-height: 1.4;
}

.btn-disabled-processing {
    opacity: 0.7;
    cursor: wait;
}

.package-id-text {
    color: #81C784;
    /* Dark Greenish */
    font-size: 0.85rem;
    margin-top: 5px;
    font-weight: 500;
    opacity: 0.9;
    text-align: center;
    text-align: center;
    padding: 2px;
    border-radius: 1px;
    align-items: center;
    justify-content: center;
    display: flex;
}

.id-code {
    font-family: monospace;
    background: rgba(76, 175, 80, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid rgba(76, 175, 80, 0.2);
    border-radius: 1px;
}

`;

const configStyles=`

/* Config Page Container */
.andro-config-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--primary-color);
    color: var(--primary-text-color);
    padding: 20px;
    align-items: center;
    overflow-x: hidden;
    overflow-y: auto;

}

.config-logo {
    width: 80px;
    margin-bottom: 15px;
    opacity: 0.9;
}

.config-title {
    font-size: 1.4rem;
    margin-bottom: 30px;
    font-weight: 600;
    color: var(--primary-text-color);
}

/* Settings Card */
.config-card {
    background-color: transparent;
    border: 1px solid var(--border-color);
    border-radius: 0;
    width: 100%;
    max-width: 500px;
    padding: 20px;
    margin-bottom: 20px;
}

.config-group {
    margin-bottom: 20px;
}

.config-label {
    display: block;
    margin-bottom: 10px;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--popup-text-color);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding-bottom: 5px;
    margin-top: 10px;
}

/* Radio Buttons Grid */
.radio-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.radio-item {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(0, 0, 0, 0.2);
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s;
}

.radio-item:hover {
    background: rgba(255, 255, 255, 0.05);
}

.radio-item input[type="radio"] {
    accent-color: #4CAF50;
    transform: scale(1.2);
}

/* Inputs */
.config-input {
    width: 100%;
    padding: 10px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--border-color);
    color: #fff;
    border-radius: 4px;
    margin-top: 5px;
}

/* Action Buttons */
.config-actions {
    display: flex;
    gap: 15px;
    width: 100%;
    max-width: 500px;
    margin-top: 10px;
}

.btn-build-start {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 12px;
    flex-grow: 2;
    border-radius: 2px;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    font-family: "Bitcount Single", system-ui;
    font-optical-sizing: auto;
    font-weight: 500;
    font-style: normal;
    font-variation-settings:
        "slnt" 0,
        "CRSV" 0.5,
        "ELSH" 0,
        "ELXP" 0;
}

.btn-build-cancel {
    background-color: transparent;
    border: 1px solid var(--border-color);
    color: #bbb;
    padding: 12px;
    flex-grow: 1;
    border-radius: 2px;
    cursor: pointer;
}

`;

const cloneStyles=`

/* Clone Bar Overlay */
.andro-clone-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 80px;
    z-index: 999;
    animation: fadeIn 0.2s;
}

.andro-clone-box {
    background-color: var(--secondary-color);
    border: 1px solid var(--border-color);
    border-radius: 50px;
    /* Fully rounded/Thin look */
    padding: 5px 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.andro-clone-input {
    flex-grow: 1;
    background: transparent;
    border: none;
    color: var(--primary-text-color);
    font-size: 0.9rem;
    padding: 8px 10px;
    outline: none;
}

.andro-clone-btn {
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 8px 20px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
}

.andro-clone-btn:active {
    transform: scale(0.95);
}

.andro-clone-btn:disabled {
    background-color: #555;
    opacity: 0.7;
    cursor: wait;
}

.andro-clone-close {
    background: transparent;
    border: none;
    color: #F44336;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0 8px;
    display: flex;
    align-items: center;
}

/* Loading Circle (CSS Only) */
.clone-loader {
    width: 14px;
    height: 14px;
    border: 2px solid #ffffff;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    animation: spin 1s linear infinite;
    display: none;
    /* Hidden by default */
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Icon Style */
.andro-clone-icon {
    width: 24px;
    height: 24px;
    margin-left: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
}

.andro-clone-icon:hover {
    opacity: 1;
}

.andro-clone-icon:active {
    transform: scale(0.9);
}

.andro-clone-icon svg {
    width: 100%;
    height: 100%;
    fill: var(--primary-text-color);
    /* Dynamic Color */
}

`;

const buildUIStyles=` .signing-section {
    display: none;
    background: rgba(0, 0, 0, 0.2);
    padding: 10px;
    border-radius: 1px;
    margin-top: 10px;
}

.input-group {
    margin-bottom: 8px;
}

.input-group label {
    display: block;
    font-size: 0.8rem;
    margin-bottom: 4px;
    color: #ccc;
}

.input-group input {
    width: 100%;
    padding: 8px;
    background: var(--primary-color);
    color: var(--primary-text-color);
    height: 33px;
    border-radius: 1px;
    border: none;
    background: var(--primary-color);
    border-bottom: 0.5px solid grey;
}

.btn-create-ks {
    background: transparent;
    color: var(--secondary-text-color);
    border: none;
    font-size: 0.8rem;
    margin-top: 5px;
    cursor: pointer;
    padding: 0 4px;
    border: none;
    border-bottom: 0.5px solid grey;
}

#btn-create-ks {
    padding: 5px 10px;
    border: 1px solid #444;
}

.gradle-card {
    background: none;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 20px;
    border: 1px solid #333;
    font-family: 'Consolas', 'Monaco', monospace;
    position: relative;
    /* For suggestion positioning */
    width: 95%;
    max-width: 400px;
}

.prop-row {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
    background: #252526;
    padding: 4px 8px;
    border-radius: 2px;
    position: relative;
    height: 10px;
    padding: 2px 0;
}

.prop-row.comment {
    border-left: 3px solid #6a9955;
    background: transparent;
    padding-left: 0;
}

.prop-key {
    color: #9cdcfe;
    background: transparent;
    border: none;
    width: 45%;
    font-family: inherit;
    font-size: 0.85rem;
    outline: none;
    padding: 2px;
}

.prop-equals {
    color: #d4d4d4;
    margin: 0 5px;
}

.prop-value {
    color: #ce9178;
    background: transparent;
    border: none;
    flex: 1;
    font-family: inherit;
    font-size: 0.85rem;
    outline: none;
    border-bottom: 1px dashed #444;
    padding: 2px;
}

.prop-comment-text {
    color: #6a9955;
    width: 100%;
    background: transparent;
    border: none;
    font-style: italic;
    font-size: 0.85rem;
}

.btn-prop-del {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    opacity: 0.6;
    display: flex;
    align-items: center;
}

.btn-prop-del:hover {
    opacity: 1;
    color: #f44336;
}

.btn-prop-del svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
}

/* Add Button Row */
.add-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 5px;
}

.btn-add-prop {
    background: transparent;
    color: #4caf50;
    border: 1px solid #4caf50;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    margin-top: 20px;
}

.btn-add-prop:hover {
    background: #4caf50;
    color: white;
}

/* Suggestion Box (DevTools Style) */
.suggestion-box {
    position: absolute;
    background: #1e1e1e;
    border: 1px solid #454545;
    z-index: 1000;
    max-height: 150px;
    overflow-y: auto;
    width: 250px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
    font-family: 'Consolas', monospace;
    font-size: 0.8rem;
    display: none;
}

.suggestion-item {
    padding: 6px 10px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    color: #ccc;
    border-bottom: 1px solid #2a2a2a;
}

.suggestion-item:last-child {
    border-bottom: none;
}

.suggestion-item:hover,
.suggestion-item.active {
    background: #094771;
    color: white;
}

.sugg-main {
    font-weight: bold;
    color: #9cdcfe;
}

.sugg-desc {
    opacity: 0.6;
    font-size: 0.7rem;
    font-style: italic;
    margin-left: 10px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    margin-top: 20px;
    gap: 94px;
}

.btn-save-prop {
    background: #0d6910;
    color: white;
    border: none;
    padding: 6px 15px;
    border-radius: 2px;
    font-size: 0.8rem;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.header-actions {
    display: flex;
    gap: 25px;
    align-items: ceneter;
}

.btn-reset-prop {
    background: #444;
    color: white;
    border: none;
    padding: 4px 10px;
    border-radius: 2px;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.btn-reset-prop:hover {
    background: #666;
}
` 

export const pageStyles=baseStyles+createPageStyles+gridStyles+configPageStyles+dropdownStyles+footerStyles+resultPageStyles+wizardStyles+buildStyles+imageGenStyles+configStyles+cloneStyles+buildUIStyles;