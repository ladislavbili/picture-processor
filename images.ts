import sharp from 'sharp';

export async function processImage(
    data: Buffer | ArrayBuffer,
    quality: number,
    size: number | 'original'
): Promise<Buffer> {
    try {
        await sharp(data).stats();
    } catch (e) {
        throw Error('Image not processable');
    }
    try {
        if (size === 'original') {
            return sharp(data)
                .jpeg({
                    quality: quality,
                    progressive: true,
                    optimizeScans: true,
                })
                .toBuffer();
        }

        return sharp(data)
            .resize(size, size, { fit: 'inside' })
            .jpeg({
                quality: quality,
                progressive: true,
                optimizeScans: true,
            })
            .toBuffer();
    } catch (error) {
        console.trace(error);
        throw Error('Image not processable');
    }
}
