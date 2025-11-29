// src/app/api/product-images/[productId]/upload/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Disable Next.js body parser
export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(
    req: Request,
    context: { params: Promise<{ productId: string }> }
) {
    const { productId } = await context.params;

    if (!productId) {
        return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("image") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "product-images" },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error("Cloudinary upload failed"));
                    resolve(result);
                }
            );
            stream.end(buffer);
        });

        const inserted = await sql`
          INSERT INTO product_images (product_id, image_url, is_primary, created_at)
          VALUES (${productId}, ${uploadResult.secure_url}, false, now())
          RETURNING id, image_url, is_primary;
        `;

        return NextResponse.json({ image: inserted[0] });
    } catch (err: unknown) {
        console.error("Upload error:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
