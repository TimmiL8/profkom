import EventCard from "./EventCard.jsx";
import {useEffect, useState} from "react";

export default function EventsPage() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            const res = await fetch('http://localhost:3001/events');
            const data = await res.json();
            setEvents(data);
        };

        fetchEvents();
    }, []);
    return (
        <>
            <div className="flex flex-wrap m-14 gap-16 items-center justify-center content-center">
                {events.map(event => (
                    <EventCard
                        key={event.id}
                        id={event.id}
                        name={event.name}
                        date={event.date}
                        place={event.place}
                        image={event.image}
                    />
                ))}
            </div>
        </>
    );
}