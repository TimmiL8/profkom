import './App.css'
import Header from "./components/Header/Header.jsx";
import { Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage/MainPage.jsx";
import SignInPage from "./components/SignInPage/SignInPage.jsx";
import EventsPage from "./components/EventsPage/EventsPage.jsx";
import AboutEvent from "./components/AboutEvent/AboutEvent.jsx";
import CreateEvent from "./components/CreateEvent/CreateEvent.jsx";
import EditEvents from "./components/EditEvents/EditEvents.jsx";
import SignUpPage from "./components/SignUpPage/SignUpPage.jsx";
import MyEvents from "./components/MyEvents/MyEvents.jsx";
import RequireAdmin from "./components/RequireAdmin/RequireAdmin.jsx";

function App() {
    return (
        <>
            <Header />
            <Routes>
                <Route index element={<MainPage />} />
                <Route path="/sign-in" element={<SignInPage />} />
                <Route path="/sign-up" element={<SignUpPage />} />
                <Route path="/create-event" element={
                    <RequireAdmin>
                        <CreateEvent />
                    </RequireAdmin>
                } />
                <Route path="/edit-events" element={
                    <RequireAdmin>
                        <EditEvents />
                    </RequireAdmin>

                } />
                <Route path="/my-events" element={<MyEvents />} />
                <Route path="/events/:aboutEvent" element={<AboutEvent />} />
                <Route path="/events" element={<EventsPage />} />
            </Routes>
        </>
    );
}

export default App;
