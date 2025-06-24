import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";

export default function AboutEvent() {
    const [event, setEvent] = useState();
    let {aboutEvent} = useParams()

    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        if (!event) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        fetch(`http://localhost:3001/subscriptions/${event.id}`, {
            headers: {Authorization: "Bearer " + token}
        })
            .then(res => res.json())
            .then(data => setSubscribed(data.subscribed));
    }, [event]);

    const handleSubscribe = async () => {
        const token = localStorage.getItem("token");
        await fetch("http://localhost:3001/subscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({event_id: event.id})
        });
        setSubscribed(true);
    };

    useEffect(() => {
        if (!aboutEvent) return;

        async function getAboutEventData() {
            try {
                const response = await fetch(`http://localhost:3001/events/${aboutEvent}/`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                setEvent(data);
            } catch (e) {
                console.error("Error of getting data from event", e.message);
            }
        }

        getAboutEventData();
    }, [aboutEvent]);


    return (
        <>
            {event ? <h1>{event.name}</h1> : <p>Loading...</p>}
            {event ? <h1>{event.date}</h1> : <p>Loading...</p>}
            {event ?
                <button onClick={handleSubscribe} disabled={subscribed} className="bg-blue-500 px-3 py-4">
                    {subscribed ? "Subscribed" : "Subscribe"}
                </button> :
                <p>Loading...</p>}
        </>
    );
}