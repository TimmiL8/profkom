import {useEffect, useState} from "react";

export default function MyEvents() {
    const [events, setEvents] = useState([]);

    const fetchSubscriptions = () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch("http://localhost:3001/my-subscriptions", {
            headers: { Authorization: "Bearer " + token }
        })
            .then(res => res.json())
            .then(data => setEvents(data))
            .catch(err => console.error("Failed to load subscriptions:", err));
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const handleUnsubscribe = async (eventId) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:3001/unsubscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({ event_id: eventId })
        });

        if (res.ok) {
            fetchSubscriptions(); // оновити після видалення
        } else {
            console.error("Unsubscribe failed");
        }
    };

    return (
        <div className="p-10">
            <h2 className="text-2xl font-bold mb-6 text-white">Your Subscribed Events</h2>
            <div className="flex flex-wrap gap-6">
                {events.length === 0 ? (
                    <p className="text-white">You are not subscribed to any events.</p>
                ) : (
                    events.map(event => (
                        <div key={event.id}
                            className="w-72 h-96 bg-gray-600 border-4 rounded-2xl overflow-hidden flex flex-col
                                transition-all duration-300 hover:scale-105">
                            <div className="h-2/3 w-full">
                                <img src={event.image} alt="" className="w-full h-full object-cover"/>
                            </div>
                            <div className="h-1/3 p-2 text-white flex flex-col justify-between">
                                <h2 className="text-center font-bold text-xl">{event.name}</h2>
                                <div className="text-sm">
                                    <p>📅 {event.date}</p>
                                    <p>📍 {event.place}</p>
                                </div>
                                <button
                                    onClick={() => handleUnsubscribe(event.id)}
                                    className="mt-4 bg-red-600 hover:bg-red-800 text-white px-2 py-1 text-sm rounded self-end"
                                >
                                    Unsubscribe
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
