import React, {useEffect, useMemo, useState} from "react";
import EventCard from "./EventCard.jsx";

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [status, setStatus] = useState("all");
    const [query, setQuery] = useState("");
    const [place, setPlace] = useState("");

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch("http://192.168.1.52:3001/events");
                const data = await res.json();
                setEvents(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    function makeLocalDate(y, m, d, hh = 0, mm = 0) {
        const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
        return Number.isNaN(dt.getTime()) ? new Date(NaN) : dt;
    }

    function parseFlexibleDate(dateStr) {
        if (!dateStr || typeof dateStr !== "string") return new Date(NaN);
        const s = dateStr.trim();

        if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(s)) {
            const safe = s.replace(" ", "T");
            const d = new Date(safe);
            return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes());
        }

        const mIso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (mIso) {
            const [, yy, mm, dd] = mIso;
            return makeLocalDate(+yy, +mm, +dd);
        }

        const mEU = s.match(/^(\d{2})[.\-/](\d{2})[.\-/](\d{4})$/);
        if (mEU) {
            const [, dd, mm, yy] = mEU;
            return makeLocalDate(+yy, +mm, +dd);
        }

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
        if (!timeStr || typeof timeStr !== "string") return {hh: null, mm: null};
        const s = timeStr.trim();
        const m = s.match(/^(\d{1,2}):(\d{2})$/);
        if (!m) return {hh: null, mm: null};
        const hh = Math.max(0, Math.min(23, parseInt(m[1], 10)));
        const mm = Math.max(0, Math.min(59, parseInt(m[2], 10)));
        return {hh, mm};
    }

    function getEventDate(ev) {
        const rawDate = (ev?.date ?? "").toString();
        const rawTime = (ev?.time ?? "").toString();
        const base = parseFlexibleDate(rawDate);
        if (Number.isNaN(base.getTime())) return new Date(NaN);

        const {hh, mm} = parseFlexibleTime(rawTime);
        if (hh !== null && mm !== null) {
            return new Date(base.getFullYear(), base.getMonth(), base.getDate(), hh, mm, 0, 0);
        }

        return new Date(base.getFullYear(), base.getMonth(), base.getDate(), 23, 59, 0, 0);
    }

    const places = useMemo(() => {
        return Array.from(
            new Set(events.map(e => (e.place || "").trim()).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b));
    }, [events]);

    const enriched = useMemo(() => {
        const now = new Date();
        const nowTs = now.getTime();
        return events.map(ev => {
            const dateObj = getEventDate(ev);
            const ts = dateObj.getTime();
            const valid = Number.isFinite(ts);
            const isPast = valid ? ts < nowTs : false;
            return {...ev, _dateObj: dateObj, _ts: valid ? ts : Number.NEGATIVE_INFINITY, _isPast: isPast};
        });
    }, [events]);

    const visible = useMemo(() => {
        let list = enriched;

        if (status === "upcoming") list = list.filter(e => !e._isPast);
        if (status === "past") list = list.filter(e => e._isPast);

        const q = query.trim().toLowerCase();
        if (q) {
            list = list.filter(e => {
                const name = (e.name || "").toLowerCase();
                const plc = (e.place || "").toLowerCase();
                return name.includes(q) || plc.includes(q);
            });
        }

        if (place) {
            list = list.filter(e => (e.place || "").trim() === place);
        }

        return list
            .slice()
            .sort((a, b) => {
                const diff = b._ts - a._ts;
                if (diff !== 0) return diff;
                return (a.name || "").localeCompare(b.name || "");
            });
    }, [enriched, status, query, place]);

    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Заходи</h1>

                <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                    <div className="inline-flex rounded-xl bg-white ring-1 ring-neutral-200 p-1">
                        <FilterTab label="Усі" value="all" active={status === "all"} onClick={() => setStatus("all")}/>
                        <FilterTab label="Майбутні" value="upcoming" active={status === "upcoming"}
                                   onClick={() => setStatus("upcoming")}/>
                        <FilterTab label="Минулі" value="past" active={status === "past"}
                                   onClick={() => setStatus("past")}/>
                    </div>

                    <div className="flex-1 sm:flex-none">
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Пошук за назвою або місцем…"
                            className="w-full sm:w-64 rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/80"
                        />
                    </div>

                    <div>
                        <select
                            value={place}
                            onChange={e => setPlace(e.target.value)}
                            className="w-full sm:w-48 rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/80"
                        >
                            <option value="">Всі локації</option>
                            {places.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <CardsSkeleton/>
            ) : visible.length === 0 ? (
                <EmptyState/>
            ) : (
                <div
                    className="grid gap-6 sm:gap-8"
                    style={{gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))"}}
                >
                    {visible.map((e) => (
                        <EventCardWrapper key={e.id} isPast={e._isPast}>
                            <EventCard event={e}/>
                        </EventCardWrapper>
                    ))}
                </div>
            )}
        </div>
    );
}

function EventCardWrapper({isPast, children}) {
    return (
        <div className="relative">
            <div className={isPast ? "grayscale opacity-70 pointer-events-none" : ""}>
                {children}
            </div>

            {isPast && (
                <div className="pointer-events-none absolute left-3 bottom-3">
                    <span
                        className="rounded-full bg-neutral-900/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white ring-1 ring-white/10">
                        Відбувся
                    </span>
                </div>
            )}
        </div>
    );
}

function FilterTab({label, active, onClick}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={
                "px-3 py-2 text-sm rounded-lg transition " +
                (active
                    ? "bg-black text-white shadow-sm"
                    : "text-neutral-700 hover:bg-neutral-100")
            }
            aria-pressed={active}
        >
            {label}
        </button>
    );
}

function CardsSkeleton() {
    return (
        <div
            className="grid gap-6 sm:gap-8"
            style={{gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))"}}
        >
            {Array.from({length: 8}).map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-200">
                    <div className="aspect-[4/3] w-full bg-neutral-200"/>
                    <div className="p-4 space-y-3">
                        <div className="h-5 w-4/5 rounded bg-neutral-200"/>
                        <div className="grid grid-cols-[20px_1fr] gap-2">
                            <div className="h-4 rounded bg-neutral-200"/>
                            <div className="h-4 rounded bg-neutral-200"/>
                        </div>
                        <div className="grid grid-cols-[20px_1fr] gap-2">
                            <div className="h-4 rounded bg-neutral-200"/>
                            <div className="h-4 rounded bg-neutral-200"/>
                        </div>
                        <div className="h-5 w-24 rounded bg-neutral-200"/>
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="rounded-2xl border border-dashed p-10 text-center text-neutral-600">
            Поки що немає подій.
        </div>
    );
}
