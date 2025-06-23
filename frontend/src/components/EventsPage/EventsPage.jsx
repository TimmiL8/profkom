import EventCard from "./EventCard.jsx";
import {useEffect, useState} from "react";

export default function EventsPage() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        setEvents([
            {
                name: "Турнір з покеру 1",
                date: "2025-12-12",
                place: "Аудиторія 0.01",
                image: "src/assets/poker_event.png"
            },
            {
                name: "Турнір з покеру 2",
                date: "2025-01-01",
                place: "Аудиторія 0.02",
                image: "src/assets/poker_event.png"
            },
            {
                name: "Турнір з покеру 3",
                date: "2025-02-02",
                place: "Аудиторія 0.3",
                image: "src/assets/poker_event.png"
            },
            {
                name: "Турнір з покеру 4",
                date: "2025-03-03",
                place: "Аудиторія 0.04",
                image: "src/assets/poker_event.png"
            },
            {
                name: "Турнір з покеру 5",
                date: "2025-03-03",
                place: "Аудиторія 0.05",
                image: "src/assets/poker_event.png"
            }
        ]);
    }, [])

    return (
        <>
            <div className="flex flex-wrap m-24 gap-28 items-center justify-center content-center">
                {events.map(event => (
                    <EventCard
                        name={event.name}
                        date={event.date}
                        place={event.place}
                        image={event.image}
                    />
                ))}
            </div>
        </>
    )
}