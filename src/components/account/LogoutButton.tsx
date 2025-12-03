"use client";

export function LogoutButton() {
    const handleLogout = async () => {
        const confirmed = window.confirm("Are you sure you want to log out?");
        if (!confirmed) return;

        await fetch("/api/auth/logout", {
            method: "POST",
        });

        window.location.href = "/login";
    };

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
            Logout
        </button>
    );
}