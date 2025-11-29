
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { sql } from "@/lib/db";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudApiKey = process.env.CLOUDINARY_API_KEY;
const cloudApiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !cloudApiKey || !cloudApiSecret) {
    throw new Error("Cloudinary environment variables are not configured");
}

cloudinary.config({
    cloud_name: cloudName,
    api_key: cloudApiKey,
    api_secret: cloudApiSecret,
});

export const runtime = "nodejs";

// POST /api/products/[productId]/images
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const { productId } = await params;
        const numericProductId = Number(productId);
        if (!Number.isInteger(numericProductId) || numericProductId <= 0) {
            return NextResponse.json(
                { error: "Invalid product ID" },
                { status: 400 }
            );
        }

        // Check if product exists
        const existingProduct = await sql`
        SELECT id
        FROM products
        WHERE id = ${numericProductId}
        LIMIT 1
        `;
        if (!existingProduct.length) {
            return NextResponse.json(
                {
                    error: `Product ${numericProductId} does not exist. Create the product before uploading images.`,
                },
                { status: 404 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("file") as Blob | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to Cloudinary
        const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "handcraft_haven/products" },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error("Cloudinary upload failed"));
                    resolve(result);
                }
            );
            stream.end(buffer);
        });

        if (!uploadResult.secure_url) {
            return NextResponse.json(
                { error: "Failed to retrieve image URL from Cloudinary" },
                { status: 500 }
            );
        }

        // Insert image URL into product_images table
        await sql`
        INSERT INTO product_images (product_id, image_url)
        VALUES (${numericProductId}, ${uploadResult.secure_url})
        `;

        return NextResponse.json({
            message: "Image uploaded successfully",
            url: uploadResult.secure_url,
        });
    } catch (err: unknown) {
        console.error("Image upload failed:", err);
        return NextResponse.json(
            { error: (err as Error).message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

// API route to fetch images for a product
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const { productId } = await params;
        const numericProductId = Number(productId);
        if (!Number.isInteger(numericProductId) || numericProductId <= 0) {
            return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
        }

        const rows = await sql`
                SELECT id, 
                image_url,
                is_primary,
                created_at
                FROM product_images
                WHERE product_id = ${numericProductId}
                ORDER BY created_at DESC`;
        return NextResponse.json({ images: rows });

    } catch (err: unknown) {
        console.error("Fetching product images failed:", err);
        return NextResponse.json({
            error: (err as Error).message || "Internal Server Error"
        }, { status: 500 });
    }
}