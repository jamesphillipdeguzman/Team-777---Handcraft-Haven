'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

type Props = {
    productId: number;
};

export default function ImageUploader({ productId }: Props) {
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [uploading, setUploading] = useState(false);

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

        const form = new FormData();
        form.append('file', file);

        setUploading(true);
        setStatus(null);

        try {
            const response = await fetch(`/api/products/${productId}/images`, {
                method: 'POST',
                body: form,
            });

            const data = await response.json();
            if (response.ok) {
                setStatus({ type: 'success', message: 'Image uploaded successfully!' });
                setPreview(null);
                setFile(null);
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
        </div>
    );
}
