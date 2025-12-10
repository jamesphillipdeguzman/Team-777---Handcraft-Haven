'use client';

import { useEffect, useState } from 'react';
import CategorySelector from '@/app/dashboard/products/add/CategorySelector';
import { Button } from '@/components/ui/button';
import { Product } from '../DashboardWelcome';

type Props = {
    artisanId: number;
    product?: Product;
    mode: 'add' | 'manage';
    onSaved: (product: Product) => void;
};

export default function AddProductForm({ artisanId, product, mode, onSaved }: Props) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    // Populate form when product changes
    useEffect(() => {
        if (mode === 'manage' && product) {
            setName(product.name);
            setDescription(product.description);
            setPrice(product.price.toString());
            setSelectedCategories(product.categoryIds || []);
        } else {
            setName('');
            setDescription('');
            setPrice('');
            setSelectedCategories([]);
        }
    }, [product, mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !description.trim() || !price.trim() || selectedCategories.length === 0) {
            alert('Please fill all fields and select at least one category.');
            return;
        }

        setLoading(true);
        try {
            const endpoint = mode === 'add' ? '/api/products/create' : `/api/products/${product?.id}`;
            const method = mode === 'add' ? 'POST' : 'PUT';

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    price: parseFloat(price),
                    artisan_id: artisanId,
                    categoryIds: selectedCategories,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save');

            onSaved(data.product);
            setSuccess(mode === 'add' ? 'Product added!' : 'Product updated!');

            setTimeout(() => setSuccess(''), 3000); // hide after 3s

            if (mode === 'add') {
                setName('');
                setDescription('');
                setPrice('');
                setSelectedCategories([]);
            }
        } catch (err) {
            console.error(err);
            alert('Error saving product. See console.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">{mode === 'add' ? 'Add Product' : 'Edit Product'}</h2>
            {success && <p className="text-green-600">{success}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium text-gray-700">Product Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium text-gray-700">Description</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
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
                        onChange={e => setPrice(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium text-gray-700">Categories</label>
                    <CategorySelector
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                    />
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? (mode === 'add' ? 'Adding...' : 'Updating...') : (mode === 'add' ? 'Add Product' : 'Update Product')}
                </Button>
            </form>
        </div>
    );
}
