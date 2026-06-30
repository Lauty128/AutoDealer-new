<?php

use App\Services\ImageOptimizer;
use Illuminate\Http\UploadedFile;

test('it optimizes, resizes and compresses an image', function () {
    // 1. Create a dummy large image (2000 x 1500 pixels) in memory
    $width = 2000;
    $height = 1500;
    $image = imagecreatetruecolor($width, $height);

    // Fill with white color
    $white = imagecolorallocate($image, 255, 255, 255);
    imagefill($image, 0, 0, $white);

    // Save it to a temporary file
    $tempFile = tempnam(sys_get_temp_dir(), 'test_image_');
    $tempFileJpg = $tempFile.'.jpg';
    rename($tempFile, $tempFileJpg);

    imagejpeg($image, $tempFileJpg, 100);
    imagedestroy($image);

    // 2. Instantiate Laravel UploadedFile
    $uploadedFile = new UploadedFile(
        $tempFileJpg,
        'test_image.jpg',
        'image/jpeg',
        null,
        true // test mode
    );

    // Assert original dimensions before optimization
    [$origWidth, $origHeight] = getimagesize($tempFileJpg);
    expect($origWidth)->toBe(2000);
    expect($origHeight)->toBe(1500);

    // 3. Optimize the file with max dimension of 1000px and threshold of 0 bytes (always optimize)
    ImageOptimizer::optimize($uploadedFile, maxDimension: 1000, quality: 70, minSizeToOptimize: 0);

    // 4. Verify optimized image properties
    [$newWidth, $newHeight] = getimagesize($tempFileJpg);
    expect($newWidth)->toBe(1000);
    expect($newHeight)->toBe(750); // maintaining 2000:1500 = 4:3 aspect ratio

    // Clean up
    @unlink($tempFileJpg);
});

test('it does not optimize if image size is below the threshold', function () {
    // 1. Create a dummy small image
    $width = 500;
    $height = 500;
    $image = imagecreatetruecolor($width, $height);

    $white = imagecolorallocate($image, 255, 255, 255);
    imagefill($image, 0, 0, $white);

    $tempFile = tempnam(sys_get_temp_dir(), 'test_image_small_');
    $tempFileJpg = $tempFile.'.jpg';
    rename($tempFile, $tempFileJpg);

    imagejpeg($image, $tempFileJpg, 90);
    imagedestroy($image);

    $uploadedFile = new UploadedFile(
        $tempFileJpg,
        'test_image_small.jpg',
        'image/jpeg',
        null,
        true
    );

    $originalSize = filesize($tempFileJpg);

    // 2. Run optimization with a high min size threshold (e.g. 500KB)
    // The image we just created is very small (around 5-20KB), so it should NOT be optimized
    ImageOptimizer::optimize($uploadedFile, maxDimension: 400, quality: 50, minSizeToOptimize: 500 * 1024);

    // 3. Verify it was NOT modified
    [$newWidth, $newHeight] = getimagesize($tempFileJpg);
    expect($newWidth)->toBe(500); // kept 500
    expect($newHeight)->toBe(500); // kept 500
    expect(filesize($tempFileJpg))->toBe($originalSize);

    @unlink($tempFileJpg);
});
