'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from '@/components/ui/button';

type Product = { id: number; name: string };
type ProductImage = { id: number; image_url: string; isPrimary: boolean };

type Props = {
    mode: "add" | "manage";
    productId?: number;
    artisanId?: number;
};

export default function ImageUploader({ mode, productId, artisanId }: Props) {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<number | undefined>(productId);
    const [images, setImages] = useState<ProductImage[]>([]);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // ───────────────
    // Load products for manage mode
    // ───────────────
    useEffect(() => {
        if (mode !== "manage" || !artisanId) return;

        (async () => {
            try {
                const res = await fetch(`/api/products/by-artisan/${artisanId}`);
                if (!res.ok) throw new Error("Failed to fetch products");

                const data = await res.json();
                const prodArray: Product[] = data.products ?? [];
                setProducts(prodArray);

                if (!selectedProductId && prodArray.length > 0) {
                    setSelectedProductId(prodArray[0].id);
                }
            } catch (err) {
                console.error("Error fetching products:", err);
            }
        })();
    }, [mode, artisanId, selectedProductId]);

    // ───────────────
    // Load images when a product is selected
    // ───────────────
    useEffect(() => {
        if (!selectedProductId) return;

        (async () => {
            try {
                const res = await fetch(`/api/product-images/${selectedProductId}`);
                if (!res.ok) throw new Error("Failed to fetch images");

                const data = await res.json();
                const validImages: ProductImage[] = (data.images ?? []).filter(
                    (img: unknown): img is ProductImage =>
                        typeof img === "object" && img !== null && "image_url" in img
                );

                setImages(validImages);
            } catch (err) {
                console.error("Error fetching images:", err);
                setImages([]);
            }
        })();
    }, [selectedProductId]);

    // ───────────────
    // Upload image
    // ───────────────
    const handleUpload = async () => {
        if (!selectedFile || !selectedProductId) return;

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("image", selectedFile);

            const res = await fetch(`/api/product-images/${selectedProductId}/upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Upload failed: ${errorText}`);
            }

            const data = await res.json();
            if (data.image?.image_url) setImages(prev => [...prev, data.image]);
            else console.warn("No image URL returned:", data);

            setSelectedFile(null);
        } catch (err) {
            console.error("Upload error:", err);
            alert("Image upload failed. See console for details.");
        } finally {
            setUploading(false);
        }
    };

    // ───────────────
    // Set primary image
    // ───────────────
    const setPrimary = async (id: number) => {
        try {
            const res = await fetch(`/api/product-images/by-image/${id}/primary`, { method: "PATCH" });
            if (!res.ok) throw new Error("Failed to set primary");
            setImages(prev => prev.map(img => ({ ...img, isPrimary: img.id === id })));
        } catch (err) {
            console.error("Error setting primary image:", err);
        }
    };

    // ───────────────
    // Delete image
    // ───────────────
    const deleteImage = async (id: number) => {
        try {
            const res = await fetch(`/api/product-images/by-image/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete image");
            setImages(prev => prev.filter(img => img.id !== id));
        } catch (err) {
            console.error("Error deleting image:", err);
        }
    };

    return (
        <div className="p-4 border rounded-xl bg-white">
            <h2 className="font-bold mb-2">Product Images</h2>

            {/* Manage mode dropdown */}
            {mode === "manage" && products.length > 0 && (
                <select
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(Number(e.target.value))}
                    className="border rounded p-2 mb-3 w-full"
                >
                    {products.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
            )}

            {mode === "manage" && products.length === 0 && (
                <p className="text-sm text-gray-500 mb-2">No products found for this artisan.</p>
            )}

            {/* Improved Upload UI */}
            {selectedProductId ? (
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
                </div>
            ) : (
                <p className="text-sm text-gray-500 mb-4">Select a product first to upload images.</p>
            )}

            {/* Image grid */}
            {images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map(img => (
                        <div key={img.id} className="w-full aspect-square relative rounded overflow-hidden border">
                            <Image
                                src={img.image_url}
                                alt="Product Image"
                                fill
                                style={{ objectFit: "cover" }}
                            />
                            <div className="absolute bottom-2 left-2 flex flex-col gap-1">
                                {!img.isPrimary && (
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
                            {img.isPrimary && (
                                <p className="absolute top-1 right-1 text-xs text-green-600 font-semibold bg-white/70 px-1 rounded">
                                    Primary
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500">No images uploaded yet.</p>
            )}
        </div>
    );
}
