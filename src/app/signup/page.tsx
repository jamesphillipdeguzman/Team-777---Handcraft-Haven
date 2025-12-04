'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"user" | "artisan">("user");
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError(null);
        setUploadingImage(true);

        try {
            const formData = new FormData();
            formData.append("image", file);

            const res = await fetch("/api/cloudinary/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok || !data?.url) {
                throw new Error(data?.error || "Upload failed");
            }

            setProfileImageUrl(data.url);
        } catch (error) {
            console.error("Profile upload failed:", error);
            setUploadError("Failed to upload profile image. Please try again.");
            setProfileImageUrl(null);
        } finally {
            setUploadingImage(false);
        }
    };

    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                password,
                role,
                name: role === "artisan" ? name : null,
                bio: role === "artisan" ? bio : null,
                profile_image: role === "artisan" ? profileImageUrl : null,
            }),
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.message || "Account created successfully!");
            router.push("/login");
        } else {
            alert(data.error || "Signup failed. Please try again.");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <form
                onSubmit={handleSubmit}
                className="bg-card p-8 rounded-lg shadow-md w-full max-w-sm flex flex-col gap-4">
                <h1 className="text-2xl font-heading text-foreground text-center">Sign Up</h1>

                {/* Role Selector */}
                <select
                    value={role}
                    onChange={e => setRole(e.target.value as "user" | "artisan")}
                    className="border border-border p-2 rounded focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="user">User</option>
                    <option value="artisan">Artisan</option>
                </select>


                {/* Email */}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="border border-border p-2 rounded focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                />

                {/* Password */}
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="border border-border p-2 rounded focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                />


                {/* Artisan fields only appear if role = artisan */}
                {role === "artisan" && (
                    <>
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="border border-border p-2 rounded focus:outline-none focus:ring-2 focus:ring-ring"
                            required
                        />
                        <textarea
                            placeholder="Bio"
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            className="border border-border p-2 rounded focus:outline-none focus:ring-2 focus:ring-ring"
                            required
                        />
                    </>
                )}

                {role === "artisan" && (
                    <>
                        <p className="text-sm text-muted-foreground">Profile Image (optional)</p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageUpload}
                            className="border border-border p-2 rounded focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        {uploadingImage && (
                            <p className="text-xs text-muted-foreground">Uploading image...</p>
                        )}
                        {profileImageUrl && !uploadingImage && (
                            <p className="text-xs text-emerald-600">Image uploaded successfully.</p>
                        )}
                        {uploadError && (
                            <p className="text-xs text-destructive">{uploadError}</p>
                        )}
                    </>
                )}

                <button
                    type="submit"
                    className="bg-primary text-primary-foreground p-2 rounded hover:bg-primary-foreground hover:text-primary transition-colors disabled:opacity-50"
                    disabled={uploadingImage}
                >
                    Sign Up
                </button>
            </form>
        </div>

    );
}
