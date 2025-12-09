"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Store,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  created_at: string;
  isArtisan: boolean;
  artisan: {
    id: number;
    name: string;
    bio: string | null;
    profile_image: string | null;
  } | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile form state
  const [email, setEmail] = useState("");
  const [artisanName, setArtisanName] = useState("");
  const [artisanBio, setArtisanBio] = useState("");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
      setEmail(data.user.email || "");
      if (data.user.artisan) {
        setArtisanName(data.user.artisan.name || "");
        setArtisanBio(data.user.artisan.bio || "");
      }
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const body: Record<string, string | undefined> = {};
      if (email !== user?.email) body.email = email;
      if (user?.isArtisan) {
        if (artisanName !== (user?.artisan?.name || "")) body.artisanName = artisanName;
        if (artisanBio !== (user?.artisan?.bio || "")) body.artisanBio = artisanBio;
      }

      if (Object.keys(body).length === 0) {
        setSuccess("No changes to save");
        setSaving(false);
        return;
      }

      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess("Profile updated successfully");
      await fetchUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setChangingPassword(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "password",
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="mt-2 text-gray-600">
              Update your personal information and preferences
            </p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 flex items-center gap-2 rounded-md bg-green-50 p-4 text-green-700">
              <CheckCircle className="h-5 w-5" />
              {success}
              <button
                onClick={clearMessages}
                className="ml-auto text-green-800 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-600">
              <AlertCircle className="h-5 w-5" />
              {error}
              <button
                onClick={clearMessages}
                className="ml-auto text-red-800 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Profile Information Form */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <h2 className="text-xl font-semibold">Profile Information</h2>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Artisan-specific fields */}
                  {user?.isArtisan && (
                    <>
                      <hr className="my-4" />
                      <div className="mb-2 flex items-center gap-2">
                        <Store className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-600">
                          Artisan Profile
                        </span>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Shop Name
                        </label>
                        <Input
                          type="text"
                          value={artisanName}
                          onChange={(e) => setArtisanName(e.target.value)}
                          placeholder="Your shop name"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Bio
                        </label>
                        <textarea
                          value={artisanBio}
                          onChange={(e) => setArtisanBio(e.target.value)}
                          placeholder="Tell customers about yourself and your craft..."
                          rows={4}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          maxLength={1000}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          {artisanBio.length}/1000 characters
                        </p>
                      </div>
                    </>
                  )}

                  <Button type="submit" disabled={saving} className="gap-2">
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Change Password Form */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-gray-600" />
                  <h2 className="text-xl font-semibold">Change Password</h2>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Must be at least 8 characters with at least 1 number
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="outline"
                    disabled={changingPassword}
                    className="gap-2"
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Change Password
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Account Info */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                <h3 className="mb-2 text-sm font-medium text-gray-700">
                  Account Information
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Account ID:</span> {user?.id}
                  </p>
                  <p>
                    <span className="font-medium">Member since:</span>{" "}
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Account type:</span>{" "}
                    {user?.isArtisan ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        <Store className="h-3 w-3" />
                        Artisan
                      </span>
                    ) : (
                      "Customer"
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
