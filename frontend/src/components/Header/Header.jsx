import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useLocation } from "react-router-dom";

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

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
    }, [location.pathname]); // запускається один раз при монтуванні

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    return (
        <header className="flex justify-between items-center bg-orange-900 h-16 px-4">
            <div>
                <Link to="/" className="header-button">Main</Link>
            </div>

            <div className="flex gap-2.5">
                <Link to="/events" className="header-button">Events</Link>

                {user?.isAdmin && (
                    <>
                        <Link to="/create-event" className="header-button">Create</Link>
                        <Link to="/edit-events" className="header-button">Edit</Link>
                    </>
                )}
            </div>


            <div className="flex gap-2 items-center">
                {user ? (
                    <>
                        <Link to="/my-events" className="text-white px-4 py-2 border rounded hover:bg-gray-700">
                            My Events
                        </Link>
                        <button onClick={handleLogout} className="header-button">Log out</button></>
                ) : (
                    <Link to="/sign-in" className="header-button">Sign In</Link>
                )}
            </div>
        </header>
    );
}