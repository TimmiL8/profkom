import './App.css'
import Header from "./components/Header/Header.jsx";
import { Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage/MainPage.jsx";
import SignInPage from "./components/SignInPage/SignInPage.jsx";

function App() {
    return (
        <>
            <Header />
            <Routes>
                <Route index element={<MainPage />} />
                <Route path="/sign-in" element={<SignInPage />} />
            </Routes>
        </>
    );
}

export default App;
