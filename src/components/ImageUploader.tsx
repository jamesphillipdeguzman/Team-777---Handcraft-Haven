'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';


export default function ImageUploader() {
    const [products, setProducts] = useState<Array<{ id: number; name: string }>>([]);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [images, setImages] = useState<Array<{ id: number; image_url: string }>>([]);
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        async function loadProducts() {
            try {
                const res = await fetch("/api/products");

                if (!res.ok) {
                    const text = await res.text();
                    console.error("API ERROR:", text);
                    return;
                }
                const data = await res.json();
                if (res.ok) {
                    setProducts(data.products);
                }
            } catch (err) {
                console.error("Failed to load products:", err);
            }
        }
        loadProducts();
    }, []);


    // Load product images when productId changes
    useEffect(() => {
        if (!selectedProductId) return;

        async function loadImages() {
            try {
                const response = await fetch(`/api/products/${selectedProductId}/images`);
                const data = await response.json();
                if (response.ok) {
                    setImages(data.images);
                }
            } catch (err) {
                console.error("Failed to load images:", err);

            }
        }
        loadImages();
    }, [selectedProductId]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        const objectUrl = URL.createObjectURL(selectedFile);
        setFile(selectedFile);
        setPreview(objectUrl);
        setStatus(null);
    }

    // Clean up the object URL to avoid memory leaks
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    async function handleUpload() {
        if (!file) {
            setStatus({ type: 'error', message: 'Please choose an image first.' });
            return;
        }

        if (!selectedProductId) {
            setStatus({ type: 'error', message: 'No product selected.' });
            return;
        }

        const form = new FormData();
        form.append('file', file);

        setUploading(true);
        setStatus(null);

        try {
            const response = await fetch(`/api/products/${selectedProductId}/images`, {
                method: 'POST',
                body: form,
            });

            const data = await response.json();
            if (response.ok) {
                setStatus({ type: 'success', message: 'Image uploaded successfully!' });
                setPreview(null);
                setFile(null);

                // Refresh the images list
                const updatedImagesResponse = await fetch(`/api/products/${selectedProductId}/images`);
                const updatedImagesData = await updatedImagesResponse.json();
                if (updatedImagesResponse.ok) {
                    setImages(updatedImagesData.images);
                }

            } else {
                setStatus({ type: 'error', message: data?.error || 'Upload failed.' });
            }
        } catch (err) {
            console.error('Upload error:', err);
            setStatus({ type: 'error', message: 'Upload failed due to network or server error.' });
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="flex flex-col gap-3 max-w-sm rounded-lg border border-border bg-card/60 p-4">
            {/* PRODUCT DROPDOWN */}
            <label htmlFor="product" className="text-sm font-medium">
                Select Product:

                <select
                    className="w-full border border-gray-300 p-2 rounded"
                    value={selectedProductId ?? ''}
                    onChange={(e) => setSelectedProductId(Number(e.target.value) || null)}
                >
                    <option value="">-- Select a product --</option>
                    {products.map((product) => (
                        <option key={product.id} value={product.id}>
                            {product.name}
                        </option>
                    ))}
                </select>

            </label>
            {/* FILE SELECT */}
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm cursor-pointer border border-gray-300 p-2"
            />

            {preview && (
                <Image
                    src={preview}
                    alt="preview"
                    width={200}
                    height={200}
                    className="h-48 w-full rounded object-cover"
                />
            )}

            {/* UPLOAD BUTTON */}

            <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded w-max disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {uploading ? 'Uploading...' : 'Upload'}
            </button>

            {status && (
                <p className={`text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {status.message}
                </p>
            )}

            {/* IMAGES GALLERY */}
            {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                    {images.map((img) => (
                        <div key={img.id} className="border border-gray-300 rounded overflow-hidden">
                            <Image
                                src={img.image_url}
                                alt={`Product Image ${img.id}`}
                                width={200}
                                height={200}
                                className="h-32 w-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
