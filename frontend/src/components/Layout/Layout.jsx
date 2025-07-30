import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col max-w-3/4 m-auto font-[Geologica] font-normal">
            <Header />

            <main className="flex-grow">
                {children}
            </main>

            <Footer />
        </div>
    );
}
