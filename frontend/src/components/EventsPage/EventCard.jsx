import React, {useMemo} from "react";
import {Link} from "react-router-dom";

export default function EventCard({ event }) {
    const {
        id,
        name,
        date: rawDate,
        place,
        price,
        image,
    } = event || {};

    const { dateStr, timeStr, chip } = useMemo(() => formatDateParts(rawDate), [rawDate]);
    const priceStr = price != null && price !== "" ? `${price} грн` : "Безкоштовно";
    const cover =
        image ||
        "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1200&q=80&auto=format&fit=crop";

    return (
        <Link to={`/events/${id}`} className="group block">
            <article className="relative overflow-hidden rounded-2xl bg-white shadow-[0_6px_24px_rgba(0,0,0,0.12)] ring-1 ring-neutral-200 transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.14)]">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <img src={cover} alt={name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                    <div className="pointer-events-none absolute left-3 top-3 flex gap-2">
                        {chip && (
                            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold shadow-sm ring-1 ring-black/5">
                {chip}
              </span>
                        )}
                        <span className="rounded-full bg-black/80 px-2.5 py-1 text-[11px] font-semibold text-white">
              {priceStr}
            </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                <div className="p-4">
                    <h3 className="line-clamp-2 min-h-[3.2rem] text-lg font-bold tracking-tight">
                        {name}
                    </h3>

                    <div className="mt-2 grid grid-cols-[20px_1fr] items-start gap-x-2 gap-y-1 text-[13px] text-neutral-600">
                        <CalendarIcon className="mt-[2px]" />
                        <div>
                            <span className="font-medium text-neutral-900">{dateStr}</span>
                            {timeStr && <span className=""> • {timeStr}</span>}
                        </div>

                        <PinIcon className="mt-[2px]" />
                        <div className="line-clamp-1" title={place}>{place || "—"}</div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-semibold text-neutral-900">{priceStr}</span>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600">
              Переглянути
              <ArrowIcon />
            </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}



function formatDateParts(raw) {
    if (!raw) return { dateStr: "—", timeStr: "", chip: null };
    const d = new Date(raw);
    const dateStr = d.toLocaleDateString("uk-UA", { day: "2-digit", month: "long" });
    const timeStr = d.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });

    // Chip: Today / Tomorrow / Soon
    const today = new Date();
    const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const d0 = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diff = Math.round((d0 - t0) / (1000 * 60 * 60 * 24));
    let chip = null;
    if (diff === 0) chip = "Сьогодні";
    else if (diff === 1) chip = "Завтра";
    else if (diff > 1 && diff <= 7) chip = "Незабаром";

    return { dateStr, timeStr, chip };
}

function CalendarIcon(props) {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-neutral-500" {...props}>
            <rect x="3" y="4" width="18" height="18" rx="3" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}

function PinIcon(props) {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-neutral-500" {...props}>
            <path d="M12 22s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z" />
            <circle cx="12" cy="11" r="2.5" />
        </svg>
    );
}

function ArrowIcon() {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="transition -translate-x-0 group-hover:translate-x-0.5">
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
        </svg>
    );
}