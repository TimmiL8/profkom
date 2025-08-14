import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function SignUpPage() {
    const [userName, setUserName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userGroup, setUserGroup] = useState("");
    const [phone, setPhone] = useState("");
    const navigate = useNavigate();

    async function handleSignUp() {
        const user_group = userGroup;
        const user_name = userName;
        // 1. РЕЄСТРАЦІЯ loopback host:
        // const response = await fetch("http://localhost:3001/register", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ user_name, surname, email, password, user_group, phone })
        // });

        const response = await fetch("http://192.168.1.52:3001/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_name, surname, email, password, user_group, phone })
        });

        const result = await response.json();
        if (!response.ok) {
            alert("Error: " + result.error);
            return;
        }

        // 2. АВТОМАТИЧНИЙ ЛОГІН on loopback host:
        // const loginResponse = await fetch("http://localhost:3001/login", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ email, password })
        // });

        const loginResponse = await fetch("http://192.168.1.52:3001/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const loginResult = await loginResponse.json();
        if (loginResponse.ok) {
            localStorage.setItem("token", loginResult.token);
            navigate("/"); // 3. ПЕРЕХІД НА ГОЛОВНУ
        } else {
            alert("Login after registration failed");
        }
    }

    return (
        <main className="h-[calc(100vh-5rem)] flex items-center justify-center">
            <div className="w-2xl h-175 bg-orange-900 rounded-lg border-8 border-amber-800 flex flex-col items-center gap-2">
                <h2 className="text-center text-amber-50 text-2xl m-2">Sign Up</h2>

                <label htmlFor="userName" className="text-amber-50 ml-2">Enter your Name</label>
                <input
                    type="text"
                    id="userName"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder=" Your Name"
                    className="bg-amber-50 rounded w-11/12 mb-4 h-8"
                />

                <label htmlFor="surname" className="text-amber-50 ml-2">Enter your Surname</label>
                <input
                    type="text"
                    id="surname"
                    value={surname}
                    onChange={e => setSurname(e.target.value)}
                    placeholder=" Your Surname"
                    className="bg-amber-50 rounded w-11/12 mb-4 h-8"
                />

                <label htmlFor="email" className="text-amber-50 ml-2">Enter your Email</label>
                <input
                    type="text"
                    id="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder=" Email"
                    className="bg-amber-50 rounded w-11/12 mb-4 h-8"
                />

                <label htmlFor="password" className="text-amber-50 ml-2">Enter your password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder=" Password"
                    className="bg-amber-50 rounded w-11/12 mb-4 h-8"
                />

                <label htmlFor="userGroup" className="text-amber-50 ml-2">Enter your group</label>
                <input
                    type="text"
                    id="group"
                    value={userGroup}
                    onChange={e => setUserGroup(e.target.value)}
                    placeholder=" Enter your academical group"
                    className="bg-amber-50 rounded w-11/12 mb-4 h-8"
                />

                <label htmlFor="phone" className="text-amber-50 ml-2">Enter your phone number</label>
                <input
                    type="text"
                    id="phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder=" Enter your phone number"
                    className="bg-amber-50 rounded w-11/12 mb-4 h-8"
                />

                <Link to="/sign-in" className="text-white">Already have an account?</Link>
                <button onClick={handleSignUp} className="bg-amber-50 px-4 py-2 mt-2 rounded">Sign Up</button>
            </div>
        </main>
    );
}