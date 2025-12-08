"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  MapPin,
  X,
  Loader2,
} from "lucide-react";

interface Address {
  id: number;
  user_id: number;
  label: string | null;
  name: string;
  street: string;
  city: string;
  state: string | null;
  zip: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

interface AddressFormData {
  label: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_default: boolean;
}

const emptyFormData: AddressFormData = {
  label: "",
  name: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "USA",
  is_default: false,
};

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch("/api/addresses");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch addresses");
      const data = await res.json();
      setAddresses(data.addresses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const openAddModal = () => {
    setEditingAddress(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label || "",
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state || "",
      zip: address.zip,
      country: address.country,
      is_default: address.is_default,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
    setFormData(emptyFormData);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const url = editingAddress
        ? `/api/addresses/${editingAddress.id}`
        : "/api/addresses";
      const method = editingAddress ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save address");
      }

      await fetchAddresses();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete address");
      }
      await fetchAddresses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete address");
    } finally {
      setDeleting(null);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_default: true }),
      });
      if (!res.ok) throw new Error("Failed to set default address");
      await fetchAddresses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set default");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Saved Addresses</h1>
              <p className="mt-2 text-gray-600">
                Manage your shipping and billing addresses
              </p>
            </div>
            <Button onClick={openAddModal} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Address
            </Button>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-red-600">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-800 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No addresses saved
              </h3>
              <p className="mt-2 text-gray-500">
                Add your first address to make checkout faster.
              </p>
              <Button onClick={openAddModal} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Address
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`relative rounded-lg border p-4 transition-shadow hover:shadow-md ${
                    address.is_default
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-200"
                  }`}
                >
                  {address.is_default && (
                    <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-1 text-xs font-medium text-white">
                      <Star className="h-3 w-3" />
                      Default
                    </div>
                  )}

                  <div className="mb-3">
                    {address.label && (
                      <span className="text-sm font-medium text-gray-500">
                        {address.label}
                      </span>
                    )}
                    <h3 className="text-lg font-semibold">{address.name}</h3>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{address.street}</p>
                    <p>
                      {address.city}
                      {address.state && `, ${address.state}`} {address.zip}
                    </p>
                    <p>{address.country}</p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(address)}
                      className="gap-1"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                    {!address.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                        className="gap-1"
                      >
                        <Star className="h-3 w-3" />
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                      disabled={deleting === address.id}
                      className="gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      {deleting === address.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Modal for Add/Edit Address */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Label (optional)
                </label>
                <Input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  placeholder="e.g., Home, Work, etc."
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Street Address *
                </label>
                <Input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="123 Main St"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <Input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <Input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="NY"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    ZIP Code *
                  </label>
                  <Input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    placeholder="10001"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <Input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="USA"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <label
                  htmlFor="is_default"
                  className="text-sm font-medium text-gray-700"
                >
                  Set as default address
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingAddress ? (
                    "Save Changes"
                  ) : (
                    "Add Address"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
