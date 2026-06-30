<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

class ImageOptimizer
{
    /**
     * Optimize an uploaded image file in-place if it exceeds the minimum size.
     *
     * @param  UploadedFile  $file  The uploaded file to optimize in-place.
     * @param  int  $maxDimension  The maximum width or height.
     * @param  int  $quality  The compression quality (1-100).
     * @param  int  $minSizeToOptimize  The minimum size in bytes to trigger optimization (default: 600KB).
     */
    public static function optimize(UploadedFile $file, int $maxDimension = 1920, int $quality = 75, int $minSizeToOptimize = 614400): void
    {
        $path = $file->getPathname();
        $mime = $file->getMimeType();
        $size = $file->getSize();

        // Only process if it is a supported image type and GD is available
        if (! str_starts_with($mime, 'image/') || ! extension_loaded('gd')) {
            return;
        }

        // Only optimize if file size exceeds the threshold (e.g., 600KB)
        if ($size <= $minSizeToOptimize) {
            return;
        }

        // Load image resource
        $image = null;
        if ($mime === 'image/jpeg' || $mime === 'image/jpg') {
            $image = @imagecreatefromjpeg($path);
        } elseif ($mime === 'image/png') {
            $image = @imagecreatefrompng($path);
        } elseif ($mime === 'image/webp') {
            $image = @imagecreatefromwebp($path);
        } elseif ($mime === 'image/gif') {
            $image = @imagecreatefromgif($path);
        }

        if (! $image) {
            return;
        }

        // Auto-rotate image if EXIF data is present (mainly JPEGs from mobile cameras)
        if (function_exists('exif_read_data') && ($mime === 'image/jpeg' || $mime === 'image/jpg')) {
            $exif = @exif_read_data($path);
            if ($exif && isset($exif['Orientation'])) {
                switch ($exif['Orientation']) {
                    case 3:
                        $image = imagerotate($image, 180, 0);
                        break;
                    case 6:
                        $image = imagerotate($image, -90, 0);
                        break;
                    case 8:
                        $image = imagerotate($image, 90, 0);
                        break;
                }
            }
        }

        // Get original dimensions
        $width = imagesx($image);
        $height = imagesy($image);

        // Resize if width or height exceeds maximum dimension
        if ($width > $maxDimension || $height > $maxDimension) {
            if ($width > $height) {
                $newWidth = $maxDimension;
                $newHeight = (int) ($height * ($maxDimension / $width));
            } else {
                $newHeight = $maxDimension;
                $newWidth = (int) ($width * ($maxDimension / $height));
            }

            $newImage = imagecreatetruecolor($newWidth, $newHeight);

            // Preserve alpha channel for transparent images
            if ($mime === 'image/png' || $mime === 'image/webp') {
                imagealphablending($newImage, false);
                imagesavealpha($newImage, true);
                $transparent = imagecolorallocatealpha($newImage, 255, 255, 255, 127);
                imagefilledrectangle($newImage, 0, 0, $newWidth, $newHeight, $transparent);
            }

            imagecopyresampled($newImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            imagedestroy($image);
            $image = $newImage;
        }

        // Save image back in-place
        if ($mime === 'image/jpeg' || $mime === 'image/jpg') {
            imagejpeg($image, $path, $quality);
        } elseif ($mime === 'image/png') {
            // Map quality (1-100) to PNG compression level (0-9)
            // Note: 9 is maximum compression (lossless, smaller size)
            $pngCompression = (int) max(0, min(9, 9 - round($quality / 10)));
            imagepng($image, $path, $pngCompression);
        } elseif ($mime === 'image/webp') {
            imagewebp($image, $path, $quality);
        } elseif ($mime === 'image/gif') {
            imagegif($image, $path);
        }

        imagedestroy($image);

        // Clear PHP file stat cache to ensure updated file size is read
        clearstatcache(true, $path);
    }
}
