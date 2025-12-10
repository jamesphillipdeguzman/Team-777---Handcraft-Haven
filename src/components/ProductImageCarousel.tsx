"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductImage {
    id: number;
    image_url: string;
    is_primary?: boolean;
}

interface Props {
    images: ProductImage[];
    layout?: "page" | "grid"; // default: "page"
}

export default function ProductImageCarousel({ images, layout = "page" }: Props) {
    const [current, setCurrent] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className={`w-full ${layout === "page" ? "h-80" : "h-40"} bg-gray-200 rounded-lg flex items-center justify-center`}>
                <span className="text-gray-500">No image</span>
            </div>
        );
    }

    // Full carousel for "page"
    if (layout === "page") {
        const next = () => setCurrent((prev) => (prev + 1) % images.length);
        const prev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);

        return (
            <div className="w-full">
                <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                        src={images[current].image_url}
                        alt="Product image"
                        fill
                        className="object-cover transition-all duration-300"
                    />
                    <button
                        onClick={prev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-2 rounded-full hover:bg-black/60"
                    >
                        ‹
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-2 rounded-full hover:bg-black/60"
                    >
                        ›
                    </button>
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {images.map((img, index) => (
                        <button
                            key={img.id}
                            onClick={() => setCurrent(index)}
                            className={`w-20 h-20 relative rounded-md overflow-hidden border ${current === index ? "border-black" : "border-transparent"}`}
                        >
                            <Image src={img.image_url} alt="Thumbnail" fill className="object-cover" />
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Simple grid layout: just show the first image
    return (
        <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden relative">
            <Image
                src={images[0].image_url}
                alt="Product image"
                fill
                className="object-cover"
            />
        </div>
    );
}
