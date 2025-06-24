import { useNavigate } from "react-router-dom";
import {Link} from "react-router-dom";

export default function SignInPage() {
    const navigate = useNavigate(); // ← додаємо

    async function submit() {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const response = await fetch("http://localhost:3001/login", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        if (response.ok) {
            localStorage.setItem("token", result.token);
            navigate("/"); // ← перекидає на головну
        } else {
            alert("Login failed: " + result.error);
        }
    }

    return (
        <main className="h-[calc(100vh-10rem)] flex items-center justify-center">
            <div className="w-2xl h-96 bg-orange-900 rounded-lg border-8 border-amber-800 flex flex-col items-center gap-3.5">
                <h2 className="text-center text-amber-50 text-2xl m-2">Sign In</h2>

                <label htmlFor="email" className="text-amber-50 ml-2">Enter your Email</label>
                <input type="text" id="email" placeholder=" Email" className="bg-amber-50 rounded w-11/12 mb-4 h-9"/>

                <label htmlFor="password" className="text-amber-50 ml-2">Enter your password</label>
                <input type="password" id="password" placeholder=" Password" className="bg-amber-50 rounded w-11/12 mb-4 h-9"/>
                <Link to={"/sign-up"} className="text-white">Don't have an account?</Link>
                <button className="bg-amber-50 px-4 py-2 mt-2 rounded" onClick={submit}>Submit</button>
            </div>
        </main>
    );
}