export const API_BASE_URL = 'http://localhost:5188';
import defaultProductImage from '@/assets/default-product.svg';

export function getImageUrl(imagePath: string | undefined | null): string {
    if (!imagePath) {
        return defaultProductImage;
    }
    
    // Remove any leading slashes
    const cleanPath = imagePath.replace(/^\/+/, '');
    
    // Check if the path already includes 'images/products'
    if (!cleanPath.startsWith('images/')) {
        // If not, add the images/products prefix
        return `${API_BASE_URL}/api/images/images/products/${cleanPath}`;
    }
    
    // If it already has the correct prefix, just add the API base
    return `${API_BASE_URL}/api/images/${cleanPath}`;
}
