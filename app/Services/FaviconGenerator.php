<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

class FaviconGenerator
{
    /**
     * Generate a favicon PNG from a (typically transparent) logo image,
     * compositing it onto a solid background color so it stays visible
     * in browser tabs regardless of light/dark tab bar theme.
     *
     * @param string $logoPath  Storage path (on the 'public' disk) of the source logo.
     * @param string $bgColor   Hex color, e.g. "#ffffff".
     * @param int    $size      Output square size in pixels.
     * @return string           Storage path (on the 'public' disk) of the generated favicon.
     */
    public static function generate(string $logoPath, string $bgColor, int $size = 64): string
    {
        $sourceFullPath = Storage::disk('public')->path($logoPath);

        if (!file_exists($sourceFullPath)) {
            throw new \RuntimeException("Logo file not found: {$sourceFullPath}");
        }

        $source = self::loadImage($sourceFullPath);
        if ($source === null) {
            throw new \RuntimeException("Unsupported or unreadable image: {$sourceFullPath}");
        }

        [$r, $g, $b] = self::hexToRgb($bgColor);

        // Build the square canvas with the chosen background color.
        $canvas = imagecreatetruecolor($size, $size);
        $bgColorRes = imagecolorallocate($canvas, $r, $g, $b);
        imagefill($canvas, 0, 0, $bgColorRes);

        // Scale the logo to fit within ~80% of the canvas, centered, preserving
        // aspect ratio and alpha transparency during the resize step.
        $srcWidth = imagesx($source);
        $srcHeight = imagesy($source);
        $maxDim = (int) round($size * 0.8);
        $scale = min($maxDim / $srcWidth, $maxDim / $srcHeight);
        $destWidth = max(1, (int) round($srcWidth * $scale));
        $destHeight = max(1, (int) round($srcHeight * $scale));
        $destX = (int) round(($size - $destWidth) / 2);
        $destY = (int) round(($size - $destHeight) / 2);

        imagealphablending($canvas, true);
        imagesavealpha($canvas, false);

        imagecopyresampled(
            $canvas,
            $source,
            $destX,
            $destY,
            0,
            0,
            $destWidth,
            $destHeight,
            $srcWidth,
            $srcHeight,
        );

        $outputRelativePath = 'favicon/generated-' . uniqid() . '.png';
        $outputFullPath = Storage::disk('public')->path($outputRelativePath);
        $outputDir = dirname($outputFullPath);
        if (!is_dir($outputDir)) {
            mkdir($outputDir, 0755, true);
        }

        imagepng($canvas, $outputFullPath);

        imagedestroy($source);
        imagedestroy($canvas);

        return $outputRelativePath;
    }

    private static function loadImage(string $path): \GdImage|null
    {
        $info = getimagesize($path);
        if ($info === false) {
            return null;
        }

        $image = match ($info[2]) {
            IMAGETYPE_PNG => imagecreatefrompng($path),
            IMAGETYPE_JPEG => imagecreatefromjpeg($path),
            IMAGETYPE_GIF => imagecreatefromgif($path),
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? imagecreatefromwebp($path) : null,
            default => null,
        };

        if ($image !== false && $image !== null) {
            imagealphablending($image, true);
            imagesavealpha($image, true);
        }

        return $image ?: null;
    }

    private static function hexToRgb(string $hex): array
    {
        $hex = ltrim($hex, '#');
        if (strlen($hex) === 3) {
            $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
        }
        if (strlen($hex) !== 6) {
            // Fall back to white on malformed input rather than throwing,
            // since this runs during a settings save and shouldn't 500 the request.
            return [255, 255, 255];
        }

        return [
            hexdec(substr($hex, 0, 2)),
            hexdec(substr($hex, 2, 2)),
            hexdec(substr($hex, 4, 2)),
        ];
    }
}
