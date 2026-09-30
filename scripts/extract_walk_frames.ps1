Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Yohalmo Esperanza\.gemini\antigravity-ide\brain\96812690-62aa-4b8f-8807-c2c0005d5db1\bea_walk_sprites_1790804462604.jpg"
$destDir = "g:\code\bea_project\assets"

if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir | Out-Null
}

$srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$w = $srcBmp.Width
$h = $srcBmp.Height

# We know the regions from previous step:
# Sprite 0: 50..273 (W=224), Y=195..793
# Sprite 1: 296..527 (W=232), Y=204..793
# Sprite 2: 537..727 (W=191), Y=204..794
# Sprite 3: 757..988 (W=232), Y=204..798

$spriteBounds = @(
    @{ Name = "bea_idle";   Start = 50;  End = 273 },
    @{ Name = "bea_walk_1"; Start = 296; End = 527 },
    @{ Name = "bea_walk_2"; Start = 537; End = 727 },
    @{ Name = "bea_walk_3"; Start = 757; End = 988 }
)

# Convert source to transparent 32bpp bitmap
$transBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($transBmp)
$g.DrawImage($srcBmp, 0, 0, $w, $h)
$g.Dispose()

# Fast lock bits for background removal
$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$bmpData = $transBmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = $bmpData.Stride
$byteCount = [Math]::Abs($stride) * $h
$pixels = New-Object byte[] $byteCount
[System.Runtime.InteropServices.Marshal]::Copy($bmpData.Scan0, $pixels, 0, $byteCount)

for ($i = 0; $i -lt $byteCount; $i += 4) {
    $b = $pixels[$i]
    $gVal = $pixels[$i + 1]
    $r = $pixels[$i + 2]
    # Check if light/white background
    if ($r -ge 225 -and $gVal -ge 225 -and $b -ge 225) {
        $pixels[$i + 3] = 0 # Transparent
    }
}

[System.Runtime.InteropServices.Marshal]::Copy($pixels, 0, $bmpData.Scan0, $byteCount)
$transBmp.UnlockBits($bmpData)

# Target frame dimensions for all frames:
# Max character width is ~232. Let's make frame canvas 256 x 620.
$frameW = 256
$frameH = 620
$paddingBottom = 4 # 4px margin from very bottom

# Export individual frames
$frames = @()

for ($s = 0; $s -lt $spriteBounds.Count; $s++) {
    $item = $spriteBounds[$s]
    # Find exact non-transparent bounds in this region
    $minX = $item.End
    $maxX = $item.Start
    $minY = $h
    $maxY = 0

    for ($x = $item.Start; $x -le $item.End; $x++) {
        for ($y = 0; $y -lt $h; $y++) {
            $p = $transBmp.GetPixel($x, $y)
            if ($p.A -gt 20) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }

    $charW = $maxX - $minX + 1
    $charH = $maxY - $minY + 1

    Write-Output "Processing $($item.Name): BoundingBox=[$minX, $minY, $charW, $charH]"

    # Create uniform framed bitmap
    $frameBmp = New-Object System.Drawing.Bitmap($frameW, $frameH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $fg = [System.Drawing.Graphics]::FromImage($frameBmp)
    $fg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $fg.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

    # Center horizontally, align feet to ($frameH - $paddingBottom)
    $destX = [Math]::Floor(($frameW - $charW) / 2)
    $destY = $frameH - $charH - $paddingBottom

    $srcRect = New-Object System.Drawing.Rectangle($minX, $minY, $charW, $charH)
    $destRect = New-Object System.Drawing.Rectangle($destX, $destY, $charW, $charH)

    $fg.DrawImage($transBmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $fg.Dispose()

    $outFilePath = Join-Path $destDir "$($item.Name).png"
    $frameBmp.Save($outFilePath, [System.Drawing.Imaging.ImageFormat]::Png)
    $frameBmp.Dispose()
    Write-Output "Saved $outFilePath"
}

# Also create Frame 4 (return pass, reuse walk_2)
$walk2Path = Join-Path $destDir "bea_walk_2.png"
$walk4Path = Join-Path $destDir "bea_walk_4.png"
Copy-Item -Path $walk2Path -Destination $walk4Path -Force
Write-Output "Saved $walk4Path (loop return frame)"

# Create a combined spritesheet: 4 walk frames side by side: walk_1, walk_2, walk_3, walk_4
$sheetW = $frameW * 4
$sheetH = $frameH
$sheetBmp = New-Object System.Drawing.Bitmap($sheetW, $sheetH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$sg = [System.Drawing.Graphics]::FromImage($sheetBmp)
$sg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor

$walkFiles = @("bea_walk_1.png", "bea_walk_2.png", "bea_walk_3.png", "bea_walk_4.png")
for ($i = 0; $i -lt 4; $i++) {
    $fPath = Join-Path $destDir $walkFiles[$i]
    $fb = [System.Drawing.Bitmap]::FromFile($fPath)
    $sg.DrawImage($fb, ($i * $frameW), 0, $frameW, $frameH)
    $fb.Dispose()
}
$sg.Dispose()

$sheetPath = Join-Path $destDir "bea_walk_sheet.png"
$sheetBmp.Save($sheetPath, [System.Drawing.Imaging.ImageFormat]::Png)
$sheetBmp.Dispose()
Write-Output "Saved spritesheet $sheetPath ($sheetW x $sheetH)"

$srcBmp.Dispose()
$transBmp.Dispose()
Write-Output "Done!"
