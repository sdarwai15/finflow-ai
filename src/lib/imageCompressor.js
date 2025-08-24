import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';

/**
 * Compress an image file safely for upload.
 * @param file Original image file
 * @param maxSizeMB Max allowed size in MB after compression
 * @param options Override default compression settings
 */
export async function compressImage(file, maxSizeMB = 5, options) {
	if (!file.type.startsWith('image/')) {
		toast.error('Only image files are allowed');
		return null;
	}

	try {
		const compressedFile = await imageCompression(file, {
			maxSizeMB,
			useWebWorker: true, // prevents UI blocking
			initialQuality: 0.7, // default compression quality
			...options,
		});

		return compressedFile;
	} catch (error) {
		console.error('Image compression failed:', error);
		toast.error('Failed to compress image. Please try again.');
		return null;
	}
}
