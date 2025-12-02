'use client';
import { useEffect, useState } from 'react';

type Props = {
    selectedCategories: number[];
    setSelectedCategories: (ids: number[]) => void;
    mode: 'add' | 'manage';
    assignedCategories?: number[];
};

const CategorySelector = ({ selectedCategories, setSelectedCategories, mode, assignedCategories }: Props) => {
    const [initialized, setInitialized] = useState(false);
    const categories = [
        { id: 1, name: 'Accessories' },
        { id: 2, name: 'Art & Decor' },
        { id: 3, name: 'Bags & Fashion' },
        { id: 4, name: 'Beauty & Wellness' },
        { id: 5, name: 'Candles & Scents' },
        { id: 6, name: 'Ceramics' },
        { id: 7, name: 'Home Decor' },
        { id: 8, name: 'Jewelry' },
        { id: 9, name: 'Kitchenware' },
        { id: 10, name: 'Plants & Pots' },
        { id: 11, name: 'Textiles' },
        { id: 12, name: 'Woodwork' },
    ];

    // Initialize selectedCategories from assignedCategories only once
    useEffect(() => {
        if (mode === 'manage' && assignedCategories && !initialized) {
            setSelectedCategories(assignedCategories);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setInitialized(true);
        }
    }, [mode, assignedCategories, initialized, setSelectedCategories]);

    const toggleCategory = (id: number) => {
        if (selectedCategories.includes(id)) {
            setSelectedCategories(selectedCategories.filter(catId => catId !== id));
        } else {
            setSelectedCategories([...selectedCategories, id]);
        }
    };

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
