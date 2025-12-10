"use client";

import { useState } from "react";
// import Link from "next/link";

export default function AccountSettingsForm() {
    const [email, setEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!email && !oldPassword && !newPassword) {
            setMessage("Please enter a new email or password before saving changes.");
            return;
        }

        const res = await fetch("/account/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                newEmail: email || undefined,
                oldPassword: oldPassword || undefined,
                newPassword: newPassword || undefined,
            }),
        });

        const data = await res.json();
        if (data.error) {
            setMessage(`Error: ${data.error}`);
        } else {
            setMessage(data.message || "Updated successfully");
            setEmail("");
            setOldPassword("");
            setNewPassword("");
        }
    }


    return (
        <div className="mt-8 max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Update Account Details</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium">New Email</label>
                    <input
                        type="email"
                        className="border p-2 w-full rounded"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <hr className="my-4" />

                <div>
                    <label className="block font-medium">Old Password</label>
                    <input
                        type="password"
                        className="border p-2 w-full rounded"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block font-medium">New Password</label>
                    <input
                        type="password"
                        className="border p-2 w-full rounded"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        className={`
              bg-blue-600 text-white px-4 py-2 rounded
              transition-colors duration-300 ease-in-out
              disabled:bg-blue-400 disabled:cursor-not-allowed
            `}
                        disabled={!email && !oldPassword && !newPassword}
                    >
                        Save Changes
                    </button>


                </div>
            </form>

            {message && <p className="text-sm mt-2">{message}</p>}
        </div>
    );
}
