import React, {useEffect, useMemo, useState} from "react";
import {useParams, Link} from "react-router-dom";

export default function AboutEvent() {
    const {aboutEvent} = useParams();
    const [event, setEvent] = useState(null);
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!aboutEvent) return;
        (async () => {
            try {
                setLoading(true);
                const res = await fetch(`http://192.168.1.52:3001/events/${aboutEvent}/`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setEvent(data);
            } catch (e) {
                console.error("Error fetching event:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, [aboutEvent]);

    useEffect(() => {
        if (!event) return;
        const token = localStorage.getItem("token");
        if (!token) return;
        fetch(`http://192.168.1.52:3001/subscriptions/${event.id}`, {
            headers: {Authorization: "Bearer " + token},
        })
            .then((r) => r.json())
            .then((d) => setSubscribed(!!d?.subscribed))
            .catch(() => {
            });
    }, [event]);

    const handleSubscribe = async () => {
        const token = localStorage.getItem("token");
        try {
            await fetch("http://192.168.1.52:3001/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
                body: JSON.stringify({event_id: event.id}),
            });
            setSubscribed(true);
        } catch (e) {
            console.error(e);
        }
    };

    const details = useMemo(() => {
        const dt = event?.date ? new Date(event.date) : null;
        const dateStr = dt ? dt.toLocaleDateString("uk-UA", {day: "2-digit", month: "2-digit", year: "numeric"}) : "—";
        const timeStr = dt ? dt.toLocaleTimeString("uk-UA", {
            hour: "2-digit",
            minute: "2-digit"
        }) : (event?.time || "—");
        return {
            date: dateStr,
            time: timeStr,
            place: event?.place || event?.location || "—",
            price: event?.price != null ? `${event.price} грн` : "Безкоштовно",
        };
    }, [event]);

    const cover =
        event?.image_url ||
        event?.poster ||
        event?.image ||
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&q=80&auto=format&fit=crop";

    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
            <div className="mb-6">
                <Link to="/events"
                      className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    Назад до заходів
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                <section>
                    {loading ? (
                        <Skeleton/>
                    ) : (
                        <>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-4">
                                {event?.name || "Назва заходу"}
                            </h1>

                            <p className="text-[15px] leading-6 text-neutral-700 mb-5">
                                {event?.description || (
                                    <>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus hendrerit,
                                        lacus eu faucibus
                                        placerat, neque est pulvinar nisl, ac molestie justo dui non tellus.
                                    </>
                                )}
                            </p>

                            <dl className="mt-6 space-y-3 text-[15px]">
                                <Row label="дата" value={details.date}/>
                                <Row label="час" value={details.time}/>
                                <Row label="місце" value={details.place}/>
                                <Row label="ціна" value={details.price}/>
                            </dl>

                            <div className="mt-7">
                                <button
                                    onClick={handleSubscribe}
                                    disabled={subscribed || loading}
                                    className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-6 py-3 text-white text-sm font-semibold shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition hover:-translate-y-[1px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.18)] disabled:bg-neutral-300 disabled:cursor-not-allowed"
                                >
                                    {subscribed ? "Зареєстровано" : "Зареєструватись"}
                                </button>
                            </div>
                        </>
                    )}
                </section>

                <aside>
                    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
                        <img
                            src={cover}
                            alt={event?.name || "Фото заходу"}
                            className="block h-[420px] w-full object-cover"
                            loading="lazy"
                        />
                    </div>
                </aside>
            </div>
        </div>
    );
}

function Row({label, value}) {
    return (
        <div className="grid grid-cols-[80px_1fr] gap-4">
            <dt className="uppercase tracking-wide text-neutral-500">{label}</dt>
            <dd className="font-medium text-neutral-900">{value}</dd>
        </div>
    );
}

function Skeleton() {
    return (
        <div className="animate-pulse">
            <div className="h-8 w-2/3 rounded bg-neutral-200 mb-4"/>
            <div className="h-4 w-full rounded bg-neutral-200 mb-2"/>
            <div className="h-4 w-11/12 rounded bg-neutral-200 mb-2"/>
            <div className="h-4 w-10/12 rounded bg-neutral-200 mb-6"/>
            <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="grid grid-cols-[80px_1fr] gap-4 items-center">
                        <div className="h-4 rounded bg-neutral-200"/>
                        <div className="h-4 rounded bg-neutral-200"/>
                    </div>
                ))}
            </div>
            <div className="mt-7 h-11 w-48 rounded-2xl bg-neutral-200"/>
        </div>
    );
}
