import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function SignInPage() {
    const navigate = useNavigate();
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    async function submit(e) {
        e?.preventDefault();
        if (loading) return;

        const email = document.getElementById("email")?.value.trim();
        const password = document.getElementById("password")?.value;

        setErr("");
        setLoading(true);
        try {
            const response = await fetch("http://192.168.1.52:3001/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const result = await response.json();
            if (response.ok) {
                localStorage.setItem("token", result.token);
                navigate("/");
            } else setErr(result?.error || "Login failed");
        } catch {
            setErr("Network error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="h-screen flex items-center justify-center px-3 sm:px-4">
            <div className="
        relative w-full max-w-sm sm:max-w-md rounded-2xl
        border border-neutral-700/80
        bg-neutral-900/95 backdrop-blur
        shadow-[0_8px_30px_rgba(0,0,0,.45)]
      ">
                <div className="pointer-events-none absolute inset-2 rounded-xl border border-neutral-800/80" />

                <form onSubmit={submit} className="relative z-10 p-4 sm:p-8 flex flex-col gap-3 sm:gap-5">
                    <header className="text-center mb-1 sm:mb-2">
                        <h2 className="text-xl sm:text-2xl font-semibold text-neutral-100 tracking-wide">Sign In</h2>
                        <p className="text-neutral-400 text-xs sm:text-sm mt-1">Увійдіть до профілю</p>
                    </header>

                    <label className="text-neutral-300 text-sm" htmlFor="email">Email</label>
                    <div className="relative">
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            className="
                w-full h-12 rounded-lg
                bg-neutral-800 text-neutral-100 placeholder-neutral-500
                outline-none ring-2 ring-transparent
                focus:ring-neutral-500
                px-3 pr-10
              "
                            onKeyDown={(e) => e.key === "Enter" && submit(e)}
                            autoComplete="email"
                            required
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-500">@</span>
                    </div>

                    <label className="text-neutral-300 text-sm" htmlFor="password">Password</label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPwd ? "text" : "password"}
                            placeholder="••••••••"
                            className="
                w-full h-12 rounded-lg
                bg-neutral-800 text-neutral-100 placeholder-neutral-500
                outline-none ring-2 ring-transparent
                focus:ring-neutral-500
                px-3 pr-12
              "
                            onKeyDown={(e) => e.key === "Enter" && submit(e)}
                            autoComplete="current-password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPwd(v => !v)}
                            className="absolute inset-y-0 right-1 px-3 text-neutral-400 hover:text-neutral-200"
                            aria-label={showPwd ? "Hide password" : "Show password"}
                        >
                            {showPwd ? "🙈" : "👁️"}
                        </button>
                    </div>

                    {err && (
                        <div className="text-sm text-red-300 bg-red-900/40 border border-red-700/50 rounded-md px-3 py-2">
                            {err}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <Link to="/sign-up" className="text-neutral-300 hover:text-neutral-100 text-sm text-center sm:text-left">
                            Don’t have an account?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="
              mt-1 h-12 rounded-lg
              bg-neutral-200 text-neutral-900 font-medium
              hover:bg-white active:bg-neutral-100
              transition disabled:opacity-60 disabled:cursor-not-allowed
              shadow
            "
                    >
                        {loading ? "Signing in…" : "Submit"}
                    </button>
                </form>
            </div>
        </main>
    );
}