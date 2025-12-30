/**
 * Image Utilities Module
 * Handles image compression and resizing for avatars
 */

const MAX_SIZE_BYTES = 100 * 1024; // 100KB
const MAX_DIMENSION = 200; // Max width/height in pixels
const INITIAL_QUALITY = 0.9;
const MIN_QUALITY = 0.1;
const QUALITY_STEP = 0.1;

/**
 * Compress an image file to be under the max size
 * @param {File} file - The image file to compress
 * @returns {Promise<string>} - Base64 encoded compressed image
 */
export async function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const img = new Image();
                img.onload = async () => {
                    const compressed = await compressImageElement(img);
                    resolve(compressed);
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Compress an image element
 * @param {HTMLImageElement} img - The image element to compress
 * @returns {Promise<string>} - Base64 encoded compressed image
 */
async function compressImageElement(img) {
    // Calculate new dimensions (maintain aspect ratio)
    let { width, height } = img;

    if (width > height) {
        if (width > MAX_DIMENSION) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
        }
    } else {
        if (height > MAX_DIMENSION) {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
        }
    }

    // Create canvas for resizing
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    // Try to compress with decreasing quality until under max size
    let quality = INITIAL_QUALITY;
    let dataUrl = canvas.toDataURL('image/jpeg', quality);

    while (getBase64Size(dataUrl) > MAX_SIZE_BYTES && quality > MIN_QUALITY) {
        quality -= QUALITY_STEP;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
    }

    // If still too large, reduce dimensions further
    if (getBase64Size(dataUrl) > MAX_SIZE_BYTES) {
        const scaleFactor = Math.sqrt(MAX_SIZE_BYTES / getBase64Size(dataUrl));
        canvas.width = Math.round(width * scaleFactor);
        canvas.height = Math.round(height * scaleFactor);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        dataUrl = canvas.toDataURL('image/jpeg', MIN_QUALITY);
    }

    console.log(`[ImageUtils] Compressed image: ${Math.round(getBase64Size(dataUrl) / 1024)}KB, ${canvas.width}x${canvas.height}, quality: ${quality.toFixed(1)}`);

    return dataUrl;
}

/**
 * Get the size of a base64 string in bytes
 * @param {string} base64 - The base64 string
 * @returns {number} - Size in bytes
 */
function getBase64Size(base64) {
    // Remove data URL prefix if present
    const base64Data = base64.split(',')[1] || base64;
    // Base64 encodes 3 bytes into 4 characters
    return Math.round((base64Data.length * 3) / 4);
}

/**
 * Validate that the file is an image
 * @param {File} file - The file to validate
 * @returns {boolean} - Whether the file is a valid image
 */
export function isValidImageFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
}

/**
 * Get image dimensions from a file
 * @param {File} file - The image file
 * @returns {Promise<{width: number, height: number}>} - The image dimensions
 */
export async function getImageDimensions(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}
