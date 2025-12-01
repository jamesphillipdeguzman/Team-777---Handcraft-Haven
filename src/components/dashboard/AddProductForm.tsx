'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    artisan_id: number;
};


type Props = {
    artisanId: number;
    onSaved: (product: Product) => void; // pass full product
};

export default function AddProductForm({ artisanId, onSaved }: Props) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return alert('Please enter a product name.');
        if (!description.trim()) return alert('Please enter a product description.');
        if (!price.trim() || isNaN(Number(price))) return alert('Please enter a valid price.');

        setLoading(true);

        try {
            const res = await fetch('/api/products/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    price: parseFloat(price),
                    artisan_id: artisanId,
                }),
            });

            const data = await res.json();

            if (res.ok && data?.product) {
                alert('Product added successfully!');
                onSaved(data.product); // pass full product
                window.location.reload(); // Reload to reflect new product in ImageUploader

                // reset form
                setName('');
                setDescription('');
                setPrice('');
            } else {
                alert('Failed to add product.');
            }
        } catch (err) {
            console.error('Error adding product:', err);
            alert('Error adding product. See console.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium text-gray-700">Product Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium text-gray-700">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium text-gray-700">Price ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                    />
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? 'Adding Product...' : 'Add Product'}
                </Button>
            </form>
        </div>
    );
}
