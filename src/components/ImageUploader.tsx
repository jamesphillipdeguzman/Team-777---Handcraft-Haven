'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from '@/components/ui/button';
import { Product } from './DashboardWelcome';

type ProductImage = {
    id: number;
    image_url: string;
    is_primary: boolean;
};

type Props = {
    mode: "add" | "manage";
    artisanId?: number;
    product?: Product;
    productId?: number;
    refreshTrigger?: number;
    onEditProduct?: (product: Product) => void;
};

export default function ImageUploader({
    // mode,
    // artisanId,
    product,
    productId,
    refreshTrigger,
    onEditProduct
}: Props) {
    const [images, setImages] = useState<ProductImage[]>([]);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [primaryImage, setPrimaryImage] = useState<ProductImage | null>(null);

    // Load images
    useEffect(() => {
        if (!productId) return;

        async function loadImages() {
            try {
                const res = await fetch(`/api/product-images/${productId}`);
                const data = await res.json();
                const imgs = data.images ?? [];
                setImages(imgs);

                const primary = imgs.find((img: ProductImage) => img.is_primary) || null;
                setPrimaryImage(primary);
            } catch (err) {
                console.error("Error fetching images:", err);
                setImages([]);
                setPrimaryImage(null);
            }
        }

        loadImages();
    }, [productId, refreshTrigger]);

    const handleUpload = async () => {
        if (!selectedFile || !productId) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("image", selectedFile);

            const res = await fetch(`/api/product-images/${productId}/upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();

            if (data.image) setImages(prev => [...prev, data.image]);
            setSelectedFile(null);
        } catch (err) {
            console.error("Upload error:", err);
            alert("Image upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const setPrimary = async (id: number) => {
        try {
            const res = await fetch(`/api/product-images/by-image/${id}/primary`, { method: "PATCH" });
            if (!res.ok) throw new Error("Failed to set primary image");
            setImages(prev => prev.map(img => ({ ...img, is_primary: img.id === id })));
        } catch (err) {
            console.error(err);
        }
    };

    const deleteImage = async (id: number) => {
        try {
            const res = await fetch(`/api/product-images/by-image/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete image");
            setImages(prev => prev.filter(img => img.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditProduct = () => {
        if (!product || !onEditProduct) return;
        onEditProduct(product); // pass real values to populate AddProductForm
    };

    return (
        <div className="p-4 border rounded-xl bg-white">
            <h2 className="font-bold mb-2">Product Images</h2>

            {productId && (
                <div className="flex items-center gap-3 mb-4">
                    <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                        {selectedFile ? "Change File" : "Choose File"}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
                            className="hidden"
                        />
                    </label>

                    {selectedFile && <span className="text-gray-700">{selectedFile.name}</span>}

                    <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                        {uploading ? "Uploading..." : "Upload"}
                    </Button>

                    {onEditProduct && (
                        <Button onClick={handleEditProduct} variant="outline" className="ml-2">
                            Edit Product
                        </Button>
                    )}
                </div>
            )}

            {primaryImage && (
                <div className="mb-4">
                    <h3 className="font-semibold">Primary Image</h3>
                    <Image
                        src={primaryImage.image_url}
                        alt="Primary"
                        width={192}
                        height={192}
                        className="w-48 rounded border-4 border-green-500 object-cover"
                    />
                </div>
            )}

            {images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map(img => (
                        <div key={img.id} className="relative w-full aspect-square border rounded overflow-hidden">
                            <Image src={img.image_url} alt="" fill className="object-cover" />

                            <div className="absolute bottom-2 left-2 flex flex-col gap-1">
                                {!img.is_primary && (
                                    <button
                                        onClick={() => setPrimary(img.id)}
                                        className="bg-blue-500 text-white text-xs py-1 px-2 rounded"
                                    >
                                        Set Primary
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteImage(img.id)}
                                    className="bg-red-500 text-white text-xs py-1 px-2 rounded"
                                >
                                    Delete
                                </button>
                            </div>

                            {img.is_primary && (
                                <span className="absolute top-1 right-1 text-xs bg-white/75 text-green-700 px-2 py-1 rounded">
                                    Primary
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-sm">No images uploaded yet.</p>
            )}
        </div>
    );
}
