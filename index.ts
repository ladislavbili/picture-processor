import { processImage } from './images';
import page from "./index.html" with { type: "file" };

const server = Bun.serve({
    port: 8999,
    async fetch(req) {
        const url = new URL(req.url);

        // Serve the HTML file at the root
        if (url.pathname === '/' || url.pathname === '/index.html') {
            const file = Bun.file(page);
            return new Response(file, {
                headers: { 'Content-Type': 'text/html' },
            });
        }

        // Handle image processing endpoint
        if (url.pathname === '/process-image' && req.method === 'POST') {
            try {
                const formData = await req.formData();
                const imageFile = formData.get('image');
                const quality = parseInt(formData.get('quality') as string) || 70;
                const sizeParam = formData.get('size') as string;
                const password = formData.get('password') as string;

                // Check password first
                if (password !== 'Send picks') {
                    return new Response('Invalid password', { status: 401 });
                }

                if (!imageFile || !(imageFile instanceof File)) {
                    return new Response('No valid image file provided', { status: 400 });
                }

                const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
                let size: number | 'original' = 'original';

                if (sizeParam && sizeParam !== 'original') {
                    const parsedSize = parseInt(sizeParam);
                    if (!isNaN(parsedSize) && parsedSize > 0) {
                        size = parsedSize;
                    }
                }

                const processedBuffer = await processImage(imageBuffer, quality, size);

                return new Response(processedBuffer, {
                    headers: {
                        'Content-Type': 'image/jpeg',
                        'Content-Disposition':
                            'attachment; filename="processed_progressive_image.jpg"',
                    },
                });
            } catch (error) {
                console.error('Error processing image:', error);
                return new Response('Error processing image: ' + (error as Error).message, {
                    status: 500,
                });
            }
        }

        return new Response('Not Found', { status: 404 });
    },
});

console.log(`Server running at http://localhost:${server.port}`);
