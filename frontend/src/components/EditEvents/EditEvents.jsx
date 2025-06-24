import {useEffect, useState} from "react";

export default function EditEvents() {
    const [events, setEvents] = useState([]);
    const fetchEvents = async () => {
        const res = await fetch('http://localhost:3001/events');
        const data = await res.json();
        setEvents(data);
    };

    useEffect(() => {
        fetchEvents();
    }, [])

    async function handleDelete(id) {
        console.log('Deleting event with id:', id);
        try {
            const res = await fetch(`http://localhost:3001/events/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                console.log('Event deleted successfully');
                // Тут можеш оновити стан, наприклад:
                setEvents(prev => prev.filter(event => event.id !== id));
            } else {
                const text = await res.text();
                console.error('Delete failed:', res.status, text);
            }
        } catch (err) {
            console.error('Error:', err);
        }
    }


    return (
        <div>
            {events.map((event) => (
                <div className="border-2 px-3 py-4 m-2 flex flex-row justify-between" key={event.id}>
                    <p>{event.name}</p>
                    <p>{event.date}</p>
                    <p>{event.place}</p>
                    <button
                        onClick={() => {
                            console.log('Try delete ID:', event.id);
                            handleDelete(event.id);
                        }}
                        className="bg-blue-500 p-1 rounded text-black transition-all duration-300 hover:bg-blue-300">
                        Delete
                    </button>
                </div>
            ))}
        </div>
    )
}