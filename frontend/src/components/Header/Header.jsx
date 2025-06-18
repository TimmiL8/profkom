import {Link} from 'react-router-dom'

export default function Header() {
    return (

        <div className="flex justify-between items-center bg-orange-900 h-16 px-4">
            <div>
                <Link
                    to="/"
                    className="border-2 px-3 py-1.5 text-white transition-all duration-300 hover:shadow-lg
                    hover:shadow-stone-300 hover:scale-105 hover:bg-orange-800 rounded inline-block"
                >
                    Button 1
                </Link>
            </div>

            <div className="flex gap-2.5">
                <Link
                    to="/"
                    className="border-2 px-3 py-1.5 text-white transition-all duration-300 hover:shadow-lg
                    hover:shadow-stone-300 hover:scale-105 hover:bg-orange-800 rounded inline-block"
                >
                    Button 2
                </Link>
                <Link
                    to="/"
                    className="border-2 px-3 py-1.5 text-white transition-all duration-300 hover:shadow-lg
                    hover:shadow-stone-300 hover:scale-105 hover:bg-orange-800 rounded inline-block"
                >
                    Button 3
                </Link>
            </div>

            <div>
                <Link
                    to="/sign-in"
                    className="border-2 px-3 py-1.5 text-white transition-all duration-300 hover:shadow-lg
                    hover:shadow-stone-300 hover:scale-105 hover:bg-orange-800 rounded inline-block"
                >
                    Sign in
                </Link>
            </div>
        </div>


    )

}