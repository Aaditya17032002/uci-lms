import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const env = process.env.REACT_APP_ENV;
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const loginMode = process.env.REACT_APP_LOGIN_MODE;

    console.log("Environment:", env);
    console.log("API Base URL:", apiBaseUrl);
    console.log("Login Mode:", loginMode);

    const handleLogin = async () => {
        if (!email) {
            setError("Please enter your email");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch("https://localhost:7080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // required for session cookies
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            console.log("Login response data:", data);

            if (data.success) {
                localStorage.setItem("roles", JSON.stringify(data.user.roles));
                localStorage.setItem("id", data.user.id.toString());
                // Store username from the response
                if (data.user.username) {
                    localStorage.setItem("userName", data.user.username);
                    console.log("Saved username:", data.user.username);
                }
                if (data.user.email) {
                    localStorage.setItem("userEmail", data.user.email);
                    console.log("Saved userEmail:", data.user.email);
                }
                console.log("Saved roles:", data.user.roles);
                console.log("Full user data:", data.user);

                // redirect to dashboard
                window.location.href = "/dashboard";
                console.log("Login successful, redirecting to dashboard...");

            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            setError("Unable to connect to server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
                <div className="flex justify-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-2xl text-indigo-600">👤</span>
                    </div>
                </div>
                <h2 className="text-center text-2xl font-bold text-gray-900">
                    Sign In to TMS
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Please sign in to continue
                </p>

                <div className="mt-6">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-3 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? "Signing in..." : "Sign in"}
                </button>

                <p className="mt-6 text-center text-xs text-gray-500">
                    By signing in, you agree to our terms of service and privacy policy.
                </p>
            </div>
        </div>
    );
}
