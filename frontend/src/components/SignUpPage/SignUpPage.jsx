import {useState} from "react";
import {useNavigate, Link} from "react-router-dom";

export default function SignUpPage() {
    const [userName, setUserName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userGroup, setUserGroup] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const navigate = useNavigate();

    async function handleSignUp(e) {
        e?.preventDefault();
        if (loading) return;

        setLoading(true);
        setErr("");

        try {
            const response = await fetch("http://192.168.1.52:3001/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    user_name: userName,
                    surname,
                    email,
                    password,
                    user_group: userGroup,
                    phone,
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                setErr(result.error || "Registration failed");
                return;
            }

            const loginResponse = await fetch("http://192.168.1.52:3001/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password}),
            });

            const loginResult = await loginResponse.json();
            if (loginResponse.ok) {
                localStorage.setItem("token", loginResult.token);
                navigate("/");
            } else {
                setErr("Login after registration failed");
            }
        } catch {
            setErr("Network error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-3 sm:px-4">
            <div className="
        relative w-full max-w-sm sm:max-w-md rounded-2xl
        border border-neutral-700/80
        bg-neutral-900/95 backdrop-blur
        shadow-[0_8px_30px_rgba(0,0,0,.45)]
      ">
                <div className="pointer-events-none absolute inset-2 rounded-xl border border-neutral-800/80"/>

                <form
                    onSubmit={handleSignUp}
                    className="relative z-10 p-4 sm:p-8 flex flex-col gap-3 sm:gap-4"
                >
                    <header className="text-center mb-2 sm:mb-4">
                        <h2 className="text-xl sm:text-2xl font-semibold text-neutral-100">Sign Up</h2>
                        <p className="text-neutral-400 text-xs sm:text-sm mt-1">
                            Створіть новий акаунт
                        </p>
                    </header>

                    <div>
                        <label htmlFor="userName" className="text-neutral-300 text-sm">Name</label>
                        <input
                            id="userName"
                            type="text"
                            value={userName}
                            onChange={e => setUserName(e.target.value)}
                            placeholder="Your name"
                            className="w-full h-12 rounded-lg bg-neutral-800 text-neutral-100 placeholder-neutral-500 px-3 focus:ring-2 focus:ring-neutral-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="surname" className="text-neutral-300 text-sm">Surname</label>
                        <input
                            id="surname"
                            type="text"
                            value={surname}
                            onChange={e => setSurname(e.target.value)}
                            placeholder="Your surname"
                            className="w-full h-12 rounded-lg bg-neutral-800 text-neutral-100 placeholder-neutral-500 px-3 focus:ring-2 focus:ring-neutral-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="text-neutral-300 text-sm">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full h-12 rounded-lg bg-neutral-800 text-neutral-100 placeholder-neutral-500 px-3 focus:ring-2 focus:ring-neutral-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="text-neutral-300 text-sm">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full h-12 rounded-lg bg-neutral-800 text-neutral-100 placeholder-neutral-500 px-3 focus:ring-2 focus:ring-neutral-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="group" className="text-neutral-300 text-sm">Group</label>
                        <input
                            id="group"
                            type="text"
                            value={userGroup}
                            onChange={e => setUserGroup(e.target.value)}
                            placeholder="Academical group"
                            className="w-full h-12 rounded-lg bg-neutral-800 text-neutral-100 placeholder-neutral-500 px-3 focus:ring-2 focus:ring-neutral-500 outline-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="text-neutral-300 text-sm">Phone</label>
                        <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="+380..."
                            className="w-full h-12 rounded-lg bg-neutral-800 text-neutral-100 placeholder-neutral-500 px-3 focus:ring-2 focus:ring-neutral-500 outline-none"
                        />
                    </div>

                    {err && (
                        <div
                            className="text-sm text-red-300 bg-red-900/40 border border-red-700/50 rounded-md px-3 py-2">
                            {err}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-1">
                        <Link to="/sign-in"
                              className="text-neutral-300 hover:text-neutral-100 text-sm text-center sm:text-left">
                            Already have an account?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="h-12 mt-2 rounded-lg bg-neutral-200 text-neutral-900 font-medium hover:bg-white active:bg-neutral-100 transition disabled:opacity-60 disabled:cursor-not-allowed shadow"
                    >
                        {loading ? "Signing up…" : "Sign Up"}
                    </button>
                </form>
            </div>
        </main>
    );
}