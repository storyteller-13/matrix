/**
 * Email Data Module
 * Manages email data structure and operations
 */

// Default email data structure (shared constant)
const DEFAULT_EMAIL_DATA = {
    inbox: [],
    sent: [],
    drafts: [],
    friends: [],
    trash: []
};

class EmailData {
    constructor() {
        // Deep clone default data to avoid shared references
        this.data = JSON.parse(JSON.stringify(DEFAULT_EMAIL_DATA));
    }

    /**
     * Get all emails from a folder
     * @param {string} folderName - Name of the folder
     * @returns {Array} Array of emails in the folder
     */
    getFolder(folderName) {
        return this.data[folderName] || [];
    }

    /**
     * Get a specific email by ID from a folder
     * @param {string} folderName - Name of the folder
     * @param {number} emailId - ID of the email
     * @returns {Object|undefined} Email object or undefined if not found
     */
    getEmail(folderName, emailId) {
        const folder = this.getFolder(folderName);
        return folder.find(email => email.id === emailId);
    }

    /**
     * Mark an email as read
     * @param {string} folderName - Name of the folder
     * @param {number} emailId - ID of the email
     * @returns {boolean} True if email was found and marked, false otherwise
     */
    markAsRead(folderName, emailId) {
        const email = this.getEmail(folderName, emailId);
        if (email) {
            email.read = true;
            return true;
        }
        return false;
    }

    /**
     * Get count for a folder
     * For inbox: returns unread count
     * For other folders: returns total count
     * @param {string} folderName - Name of the folder
     * @returns {number} Count of emails (unread for inbox, total for others)
     */
    getUnreadCount(folderName) {
        const folder = this.getFolder(folderName);
        if (folderName === 'inbox') {
            return folder.filter(email => !email.read).length;
        }
        return folder.length;
    }
}

// Expose class and default data for testing/sharing
if (typeof window !== 'undefined') {
    window.EmailData = EmailData;
    window.DEFAULT_EMAIL_DATA = DEFAULT_EMAIL_DATA;
}
