import { useEffect, useMemo, useState } from "react";
import EventSubCard from "./EventSubCard.jsx";

export default function MyEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const fetchSubscriptions = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setEvents([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await fetch("http://192.168.1.52:3001/my-subscriptions", {
                headers: { Authorization: "Bearer " + token },
            });
            const data = await res.json();
            setEvents(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Failed to load subscriptions:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    // ---------- Парс дати/часу (локально, без UTC-зсувів) ----------
    function makeLocalDate(y, m, d, hh = 0, mm = 0) {
        const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
        return Number.isNaN(dt.getTime()) ? new Date(NaN) : dt;
    }

    function parseFlexibleDate(dateStr) {
        if (!dateStr || typeof dateStr !== "string") return new Date(NaN);
        const s = dateStr.trim();

        // 2025-08-14T18:30 або "2025-08-14 18:30"
        if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(s)) {
            const safe = s.replace(" ", "T");
            const d = new Date(safe);
            return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes());
        }

        // 2025-08-14
        const mIso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (mIso) {
            const [, yy, mm, dd] = mIso;
            return makeLocalDate(+yy, +mm, +dd);
        }

        // ДД.ММ.РРРР / ДД/ММ/РРРР / ДД-ΜΜ-РРРР
        const mEU = s.match(/^(\d{2})[.\-/](\d{2})[.\-/](\d{4})$/);
        if (mEU) {
            const [, dd, mm, yy] = mEU;
            return makeLocalDate(+yy, +mm, +dd);
        }

        // РРРР.ММ.ДД
        const mYMD = s.match(/^(\d{4})[.\-/](\d{2})[.\-/](\d{2})$/);
        if (mYMD) {
            const [, yy, mm, dd] = mYMD;
            return makeLocalDate(+yy, +mm, +dd);
        }

        const d = new Date(s);
        if (!Number.isNaN(d.getTime())) {
            return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes());
        }
        return new Date(NaN);
    }

    function parseFlexibleTime(timeStr) {
        if (!timeStr || typeof timeStr !== "string") return { hh: null, mm: null };
        const s = timeStr.trim();
        const m = s.match(/^(\d{1,2}):(\d{2})$/);
        if (!m) return { hh: null, mm: null };
        const hh = Math.max(0, Math.min(23, parseInt(m[1], 10)));
        const mm = Math.max(0, Math.min(59, parseInt(m[2], 10)));
        return { hh, mm };
    }

    function getEventDate(ev) {
        const rawDate = (ev?.date ?? "").toString();
        const rawTime = (ev?.time ?? "").toString();
        const base = parseFlexibleDate(rawDate);
        if (Number.isNaN(base.getTime())) return new Date(NaN);

        const { hh, mm } = parseFlexibleTime(rawTime);
        if (hh !== null && mm !== null) {
            return new Date(base.getFullYear(), base.getMonth(), base.getDate(), hh, mm, 0, 0);
        }
        // без часу — вважаємо 23:59, щоб подія стала «минулою» наступного дня
        return new Date(base.getFullYear(), base.getMonth(), base.getDate(), 23, 59, 0, 0);
    }

    // ---------- Збагачення + групування ----------
    const grouped = useMemo(() => {
        const nowTs = Date.now();
        const enriched = events.map(ev => {
            const d = getEventDate(ev);
            const ts = d.getTime();
            return {
                ...ev,
                _dateObj: d,
                _ts: Number.isFinite(ts) ? ts : Number.NEGATIVE_INFINITY,
                _isPast: Number.isFinite(ts) ? ts < nowTs : false,
            };
        });

        const upcoming = enriched
            .filter(e => !e._isPast)
            .sort((a, b) => b._ts - a._ts || (a.name || "").localeCompare(b.name || ""));

        const past = enriched
            .filter(e => e._isPast)
            .sort((a, b) => b._ts - a._ts || (a.name || "").localeCompare(b.name || ""));

        return { upcoming, past };
    }, [events]);

    // ---------- Відписка (доступна лише для майбутніх) ----------
    const handleUnsubscribe = async (eventId) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        // оптимістично: видаляємо тільки з майбутніх, минулі не чіпаємо
        const prev = events;
        setEvents(list => list.filter(e => e.id !== eventId));

        try {
            const res = await fetch("http://192.168.1.52:3001/unsubscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
                body: JSON.stringify({ event_id: eventId }),
            });
            if (!res.ok) throw new Error("Unsubscribe failed");
            setMessage("Відписано від події");
        } catch (e) {
            console.error(e);
            setEvents(prev); // rollback
            setMessage("Сталася помилка при відписці");
        }
    };

    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Мої підписки</h1>

            {loading ? (
                <CardsSkeleton />
            ) : (grouped.upcoming.length === 0 && grouped.past.length === 0) ? (
                <EmptyState />
            ) : (
                <div className="space-y-10">
                    {/* --------- Майбутні --------- */}
                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-lg sm:text-xl font-semibold">Майбутні</h2>
                            <span className="text-sm text-neutral-500">{grouped.upcoming.length}</span>
                        </div>

                        {grouped.upcoming.length === 0 ? (
                            <div className="rounded-xl border border-dashed p-6 text-center text-neutral-600">
                                Немає майбутніх подій.
                            </div>
                        ) : (
                            <div
                                className="grid gap-6 sm:gap-8"
                                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
                            >
                                {grouped.upcoming.map(e => (
                                    <EventSubCard key={e.id} event={e} onUnsub={() => handleUnsubscribe(e.id)} />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* --------- Минулі --------- */}
                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-lg sm:text-xl font-semibold">Минулі</h2>
                            <span className="text-sm text-neutral-500">{grouped.past.length}</span>
                        </div>

                        {grouped.past.length === 0 ? (
                            <div className="rounded-xl border border-dashed p-6 text-center text-neutral-600">
                                Немає минулих подій.
                            </div>
                        ) : (
                            <div
                                className="grid gap-6 sm:gap-8"
                                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
                            >
                                {grouped.past.map(e => (
                                    <PastCardWrapper key={e.id}>
                                        {/* НЕ передаємо onUnsub → відписатися від минулих неможливо */}
                                        <EventSubCard event={e} />
                                    </PastCardWrapper>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}

            {message && <p className="mt-4 text-sm text-neutral-600">{message}</p>}
        </div>
    );
}

/* ---- Обгортка для минулих: grayscale + бейдж у лівому нижньому куті ---- */
function PastCardWrapper({ children }) {
    return (
        <div className="relative">
            <div className="grayscale opacity-70 pointer-events-none">
                {children}
            </div>
            <div className="pointer-events-none absolute left-3 bottom-3">
                <span className="rounded-full bg-neutral-900/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white ring-1 ring-white/10">
                    Відбувся
                </span>
            </div>
        </div>
    );
}

function CardsSkeleton() {
    return (
        <div
            className="grid gap-6 sm:gap-8"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
        >
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-200">
                    <div className="aspect-[4/3] w-full bg-neutral-200" />
                    <div className="p-4 space-y-3">
                        <div className="h-5 w-4/5 rounded bg-neutral-200" />
                        <div className="grid grid-cols-[20px_1fr] gap-2">
                            <div className="h-4 rounded bg-neutral-200" />
                            <div className="h-4 rounded bg-neutral-200" />
                        </div>
                        <div className="grid grid-cols-[20px_1fr] gap-2">
                            <div className="h-4 rounded bg-neutral-200" />
                            <div className="h-4 rounded bg-neutral-200" />
                        </div>
                        <div className="h-5 w-24 rounded bg-neutral-200" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="rounded-2xl border border-dashed p-10 text-center text-neutral-600">
            Ти ще не підписаний на жодну подію. Переглянь список заходів і підпишись на цікаві.
        </div>
    );
}
