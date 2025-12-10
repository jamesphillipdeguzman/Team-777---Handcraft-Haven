'use client';
import React, { useEffect, useState } from 'react';

type Category = {
    id: number;
    name: string;
};

type Props = {
    selectedCategories: number[];
    setSelectedCategories: (ids: number[]) => void;
    mode?: 'add' | 'manage';            // optional
    assignedCategories?: number[];      // optional
};

const CategorySelector = ({ selectedCategories, setSelectedCategories }: Props) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch categories from API
    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                setCategories(data.categories || []);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
                setLoading(false);
            });
    }, []);

    const toggleCategory = (id: number) => {
        if (selectedCategories.includes(id)) {
            setSelectedCategories(selectedCategories.filter(catId => catId !== id));
        } else {
            setSelectedCategories([...selectedCategories, id]);
        }
    };

    if (loading) return <div className="text-gray-500">Loading categories...</div>;
    if (categories.length === 0) return <div className="text-gray-500">No categories available</div>;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map(cat => (
                <label key={cat.id} className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                    />
                    {cat.name}
                </label>
            ))}
        </div>
    );
};

export default CategorySelector;
