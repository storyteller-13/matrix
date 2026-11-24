/**
 * Picture viewer for the terminal's `view` command. Opens an image in the artwork window when it is
 * open, otherwise in a full-screen modal. A file that cannot be loaded is reported through onMissing.
 */

const MODAL_ID = 'terminal-image-modal';

/**
 * @param {Object} options
 * @param {(imagePath: string) => void} options.onMissing - called when the image file does not load.
 * @returns {{ open: (imagePath: string) => void, close: () => void }}
 */
export function createPictureViewer({ onMissing = () => {} } = {}) {
    function createImageModal() {
        let modal = document.getElementById(MODAL_ID);
        if (modal) return modal;

        modal = document.createElement('div');
        modal.id = MODAL_ID;
        Object.assign(modal.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '10000',
            cursor: 'pointer',
            opacity: '0',
            transition: 'opacity 0.3s ease'
        });

        modal.addEventListener('click', close);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display !== 'none') {
                close();
            }
        });

        document.body.appendChild(modal);
        return modal;
    }

    function open(imagePath) {
        const testImg = new Image();

        testImg.onerror = () => onMissing(imagePath);

        testImg.onload = () => {
            if (window.ArtworkApp && typeof window.ArtworkApp.openImage === 'function') {
                window.ArtworkApp.openImage(imagePath);
                return;
            }

            const modal = createImageModal();
            let img = modal.querySelector('img');

            if (!img) {
                img = document.createElement('img');
                Object.assign(img.style, {
                    maxWidth: '90%',
                    maxHeight: '90%',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 0 40px rgba(219, 20, 147, 0.5)',
                    cursor: 'default'
                });
                img.addEventListener('click', (e) => e.stopPropagation());
                modal.appendChild(img);
            }

            img.src = imagePath;
            modal.style.display = 'flex';
            requestAnimationFrame(() => {
                modal.style.opacity = '1';
            });
        };

        testImg.src = imagePath;
    }

    function close() {
        const modal = document.getElementById(MODAL_ID);
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    return { open, close };
}
