export default function SignInPage() {
    return (
        <main className="h-[calc(100vh-10rem)] flex items-center justify-center">
            <div className="w-2xl h-96 bg-orange-900 rounded-lg border-8 border-amber-800 flex flex-col items-center gap-3.5">
                <h2 className="text-center text-amber-50 text-2xl m-2">Sign In</h2>
                <label htmlFor="email" className="text-amber-50 ml-2">Enter your Email</label>
                <input type="text" id="email" placeholder=" Email" className="bg-amber-50 rounded w-11/12 mb-4 h-9"/>

                <label htmlFor="password" className="text-amber-50 ml-2">Enter your password</label>
                <input type="password" id="password" placeholder=" Password" className="bg-amber-50 rounded w-11/12 mb-4 h-9"/>

                <button className="bg-amber-50 px-4 py-2 mt-2 rounded">Submit</button>
            </div>
        </main>

    );
}
