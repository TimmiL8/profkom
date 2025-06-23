import {Link} from 'react-router-dom'

export default function Header() {
    return (

        <header className="flex justify-between items-center bg-orange-900 h-16 px-4">
            <div>
                <Link
                    to="/"
                    className="header-button"
                >
                    Main
                </Link>
            </div>

            <div className="flex gap-2.5">
                <Link
                    to="/events"
                    className="header-button"
                >
                    Events
                </Link>
                <Link
                    to="/"
                    className="header-button"
                >
                    Button 3
                </Link>
            </div>

            <div>
                <Link
                    to="/sign-in"
                    className="header-button"
                >
                    Sign in
                </Link>
            </div>
        </header>


    )

}