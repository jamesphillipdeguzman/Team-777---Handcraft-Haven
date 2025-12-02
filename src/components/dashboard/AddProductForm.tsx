'use client';

import { useEffect, useState } from 'react';
import CategorySelector from '@/app/dashboard/products/add/CategorySelector';
import { Button } from '@/components/ui/button';
import { Product } from '../DashboardWelcome';

type Props = {
    artisanId: number;
    onSaved: (product: Product) => void; // pass full product to parent
    mode?: 'add' | 'manage';
    product?: Product;
};

export default function AddProductForm({ artisanId, onSaved, mode = 'add', product }: Props) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    // Populate fields when product changes (manage mode)
    useEffect(() => {
        if (mode === 'manage' && product) {
            setName(product.name);
            setDescription(product.description);
            setPrice(product.price.toString());
            setSelectedCategories(product.categoryIds ?? []);
        } else if (mode === 'add') {
            setName('');
            setDescription('');
            setPrice('');
            setSelectedCategories([]);
        }
    }, [mode, product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!name.trim()) return alert('Please enter a product name.');
        if (!description.trim()) return alert('Please enter a product description.');
        if (!price.trim() || isNaN(Number(price))) return alert('Please enter a valid price.');
        if (selectedCategories.length === 0) return alert('Please select at least one category.');

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
                    categoryIds: selectedCategories,
                    artisan_id: artisanId,
                }),
            });

            const data = await res.json();

            if (res.ok && data?.product) {
                alert(mode === 'add' ? 'Product added successfully!' : 'Product updated successfully!');
                onSaved(data.product);

                if (mode === 'add') {
                    // Reset form fields after adding new product
                    setName('');
                    setDescription('');
                    setPrice('');
                    setSelectedCategories([]);
                }
            } else {
                alert('Failed to save product.');
            }
        } catch (err) {
            console.error('Error saving product:', err);
            alert('Error saving product. See console.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">
                {mode === 'add' ? 'Add New Product' : 'Edit Product'}
            </h2>
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

                <div>
                    <label className="block mb-1 font-medium text-gray-700">Categories</label>
                    <CategorySelector
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                        mode={mode}
                        assignedCategories={product?.categoryIds ?? []}
                    />
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? (mode === 'add' ? 'Adding Product...' : 'Updating Product...') :
                        (mode === 'add' ? 'Add Product' : 'Update Product')}
                </Button>
            </form>
        </div>
    );
}
