"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import CategorySelector from "./CategorySelector";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";

export default function AddProductPage() {
    const router = useRouter();
    const [artisanId, setArtisanId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Validation errors
    const [errors, setErrors] = useState<{
        name?: string;
        description?: string;
        price?: string;
        categories?: string;
        images?: string;
    }>({});

    // Check authentication and get artisan ID
    useEffect(() => {
        async function checkAuth() {
            try {
                const userRes = await fetch("/api/auth/me", { credentials: "include" });
                const userData = await userRes.json();

                if (!userData?.user?.id) {
                    router.push("/login?redirect=/dashboard/products/add");
                    return;
                }

                const artisanRes = await fetch(`/api/artisans/by-user/${userData.user.id}`);
                const artisanData = await artisanRes.json();

                if (!artisanData?.artisan?.id) {
                    setError("You must be registered as an artisan to add products.");
                    setLoading(false);
                    return;
                }

                setArtisanId(artisanData.artisan.id);
                setLoading(false);
            } catch (err) {
                console.error("Auth check failed:", err);
                setError("Failed to verify authentication. Please try again.");
                setLoading(false);
            }
        }

        checkAuth();
    }, [router]);

    // Handle image selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Limit to 5 images
        const newImages = [...images, ...files].slice(0, 5);
        setImages(newImages);

        // Create preview URLs
        const newPreviews = newImages.map((file) => URL.createObjectURL(file));
        // Clean up old preview URLs
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        setImagePreviews(newPreviews);

        if (errors.images) {
            setErrors((prev) => ({ ...prev, images: undefined }));
        }
    };

    // Remove image
    const removeImage = (index: number) => {
        URL.revokeObjectURL(imagePreviews[index]);
        setImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!name.trim()) {
            newErrors.name = "Product name is required";
        } else if (name.length > 255) {
            newErrors.name = "Product name must be less than 255 characters";
        }

        if (!description.trim()) {
            newErrors.description = "Description is required";
        } else if (description.length > 5000) {
            newErrors.description = "Description must be less than 5000 characters";
        }

        if (!price.trim()) {
            newErrors.price = "Price is required";
        } else if (isNaN(Number(price)) || Number(price) < 0) {
            newErrors.price = "Please enter a valid price";
        } else if (Number(price) > 999999.99) {
            newErrors.price = "Price must be less than $1,000,000";
        }

        if (selectedCategories.length === 0) {
            newErrors.categories = "Please select at least one category";
        }

        if (images.length === 0) {
            newErrors.images = "Please upload at least one image";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) return;
        if (!artisanId) return;

        setSubmitting(true);

        try {
            // Create product
            const productRes = await fetch("/api/products/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    price: parseFloat(price),
                    categoryIds: selectedCategories,
                    artisan_id: artisanId,
                }),
            });

            const productData = await productRes.json();

            if (!productRes.ok || !productData?.product?.id) {
                throw new Error(productData?.error || "Failed to create product");
            }

            const productId = productData.product.id;

            // Upload images
            for (let i = 0; i < images.length; i++) {
                const formData = new FormData();
                formData.append("image", images[i]);

                const uploadRes = await fetch(`/api/product-images/${productId}/upload`, {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) {
                    console.error(`Failed to upload image ${i + 1}`);
                }
            }

            // Redirect to dashboard on success
            router.push("/dashboard?success=product-added");
        } catch (err) {
            console.error("Error creating product:", err);
            setError(err instanceof Error ? err.message : "Failed to create product. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading...</span>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error && !artisanId) {
        return (
            <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">
                    <div className="container mx-auto px-4 py-8">
                        <div className="max-w-md mx-auto text-center">
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                                <h1 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">
                                    Access Denied
                                </h1>
                                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                                <Link href="/dashboard">
                                    <Button>Go to Dashboard</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 bg-gray-50 dark:bg-background">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold">Add New Product</h1>
                        <p className="text-muted-foreground mt-1">
                            Create a new product listing for your shop
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="max-w-2xl">
                        <div className="bg-white dark:bg-card rounded-lg shadow-sm border p-6 space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                                    {error}
                                </div>
                            )}

                            {/* Product Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-1">
                                    Product Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                                    }}
                                    className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent ${
                                        errors.name ? "border-red-500" : "border-border"
                                    }`}
                                    placeholder="Enter product name"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => {
                                        setDescription(e.target.value);
                                        if (errors.description)
                                            setErrors((prev) => ({ ...prev, description: undefined }));
                                    }}
                                    rows={4}
                                    className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent resize-none ${
                                        errors.description ? "border-red-500" : "border-border"
                                    }`}
                                    placeholder="Describe your product..."
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                                )}
                            </div>

                            {/* Price */}
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium mb-1">
                                    Price ($) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={price}
                                    onChange={(e) => {
                                        setPrice(e.target.value);
                                        if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
                                    }}
                                    className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent ${
                                        errors.price ? "border-red-500" : "border-border"
                                    }`}
                                    placeholder="0.00"
                                />
                                {errors.price && (
                                    <p className="text-sm text-red-500 mt-1">{errors.price}</p>
                                )}
                            </div>

                            {/* Categories */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Categories <span className="text-red-500">*</span>
                                </label>
                                <CategorySelector
                                    selectedCategories={selectedCategories}
                                    setSelectedCategories={(cats) => {
                                        setSelectedCategories(cats);
                                        if (errors.categories)
                                            setErrors((prev) => ({ ...prev, categories: undefined }));
                                    }}
                                    mode="add"
                                />
                                {errors.categories && (
                                    <p className="text-sm text-red-500 mt-1">{errors.categories}</p>
                                )}
                            </div>

                            {/* Images */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Product Images <span className="text-red-500">*</span>
                                    <span className="text-muted-foreground font-normal ml-1">
                                        (up to 5 images)
                                    </span>
                                </label>

                                {/* Image previews */}
                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                                        {imagePreviews.map((preview, index) => (
                                            <div
                                                key={index}
                                                className="relative aspect-square rounded-lg overflow-hidden border"
                                            >
                                                <Image
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                                {index === 0 && (
                                                    <span className="absolute bottom-1 left-1 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">
                                                        Primary
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload button */}
                                {images.length < 5 && (
                                    <label
                                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                                            errors.images ? "border-red-500" : "border-border"
                                        }`}
                                    >
                                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                        <span className="text-sm text-muted-foreground">
                                            Click to upload images
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                                {errors.images && (
                                    <p className="text-sm text-red-500 mt-1">{errors.images}</p>
                                )}
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" disabled={submitting} className="flex-1">
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating Product...
                                        </>
                                    ) : (
                                        "Create Product"
                                    )}
                                </Button>
                                <Link href="/dashboard">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}
