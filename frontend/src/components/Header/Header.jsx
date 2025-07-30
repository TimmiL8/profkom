import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useLocation } from "react-router-dom";
import logo from "../../assets/icons/profkom-logo.svg"

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch (err) {
                localStorage.removeItem("token");
                setUser(null);
            }
        }
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    return (
        <header className="z-50 relative">
            <div className="mx-auto px-6 py-4 flex items-center justify-between">

                <div className="flex items-center gap-2">
                    <Link to="/"><img src={logo} alt="Student Union Logo" className="h-14 w-auto" /></Link>

                </div>

                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex gap-6 text-2xl text-neutral-800 font-medium mr-4">
                        <Link to="/" className={location.pathname === "/" ? "font-bold" : ""}>Головна</Link>
                        <Link to="/events" className={location.pathname === "/events" ? "font-bold" : ""}>Заходи</Link>
                    </nav>

                    <button
                        className="text-red-600 ml-4 transition-transform duration-200 hover:scale-110"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`w-8 h-8 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}
                        >
                            <path d="M3 6h18" />
                            <path d="M3 12h18" />
                            <path d="M3 18h18" />
                        </svg>
                    </button>
                </div>
                </div>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out px-6 ${
                    isOpen ? "max-h-96 opacity-100 py-4" : "max-h-0 opacity-0 py-0"
                } flex flex-col gap-4 text-xl text-neutral-800 font-medium`}
            >
                <Link to="/" className={location.pathname === "/" ? "font-bold md:hidden" : "md:hidden"}>Головна</Link>
                <Link to="/events" className={location.pathname === "/events" ? "font-bold md:hidden" : "md:hidden"}>Заходи</Link>
                {user?.isAdmin && (
                    <>
                        <Link to="/create-event" className={location.pathname === "/create-event" ? "font-bold" : ""}>Create</Link>
                        <Link to="/edit-events" className={location.pathname === "/edit-events" ? "font-bold" : ""}>Edit</Link>
                    </>
                )}
                {user ? (
                    <>
                        <Link
                            to="/my-events"
                            className="text-white px-4 py-2 border rounded hover:bg-gray-700 bg-black w-fit"
                        >
                            My Events
                        </Link>
                        <button onClick={handleLogout} className="header-button">Log out</button>
                    </>
                ) : (
                    <>
                        <Link to="/sign-in" className="header-button">Sign In</Link>
                    </>
                )}

            </div>
            <hr className="w-full border-t-2 border-black mb-2"/>
        </header>
    );
}