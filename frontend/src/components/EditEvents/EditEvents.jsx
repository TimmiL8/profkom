import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export default function EditEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState({ key: "date", dir: "asc" });

    const [confirm, setConfirm] = useState({ open: false, id: null });

    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: "", place: "", date: "", time: "", price: "" });

    const apiBase = "http://192.168.1.52:3001";

    // ----------- API helper
    const api = (url, options = {}) => {
        const token = localStorage.getItem("token");
        return fetch(`${apiBase}${url}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
                ...(token ? { Authorization: "Bearer " + token } : {}),
            },
        });
    };

    // ----------- Load events
    async function fetchEvents() {
        try {
            setLoading(true);
            const res = await api(`/events`);
            const data = await res.json();
            setEvents(Array.isArray(data) ? data : []);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { fetchEvents(); }, []);

    // ----------- Date/Time utils
    const pad2 = (n) => String(n).padStart(2, "0");
    const toDateInput = (iso) => {
        if (!iso) return "";
        const d = new Date(iso);
        return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    };
    const toTimeInput = (iso) => {
        if (!iso) return "";
        const d = new Date(iso);
        return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    };
    const composeISO = (dateStr, hhmm) => {
        const datePart = dateStr || toDateInput(new Date().toISOString());
        const timePart = hhmm || "00:00";
        return new Date(`${datePart}T${timePart}`).toISOString();
    };

    // ----------- Display formatters
    const fmtDate = (iso) => {
        if (!iso) return "—";
        const d = new Date(iso);
        return d.toLocaleDateString("uk-UA", { year: "numeric", month: "2-digit", day: "2-digit" });
    };
    const fmtTime = (iso) => {
        if (!iso) return "";
        const d = new Date(iso);
        return d.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit", hour12: false });
    };

    // ----------- Search & Sort
    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return events;
        return events.filter((e) =>
            [e.name, e.place, e.price, e.date].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
        );
    }, [events, search]);

    const sorted = useMemo(() => {
        const arr = [...filtered];
        const { key, dir } = sortBy;
        arr.sort((a, b) => {
            let av = a[key], bv = b[key];
            if (key === "date") {
                av = av ? new Date(av).getTime() : 0;
                bv = bv ? new Date(bv).getTime() : 0;
            } else {
                av = (av ?? "").toString().toLowerCase();
                bv = (bv ?? "").toString().toLowerCase();
            }
            if (av < bv) return dir === "asc" ? -1 : 1;
            if (av > bv) return dir === "asc" ? 1 : -1;
            return 0;
        });
        return arr;
    }, [filtered, sortBy]);

    const toggleSort = (key) =>
        setSortBy((p) => (p.key === key ? { key, dir: p.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

    // ----------- Delete
    const openConfirm = (id) => setConfirm({ open: true, id });
    const closeConfirm = () => setConfirm({ open: false, id: null });

    async function deleteConfirmed() {
        const id = confirm.id;
        closeConfirm();
        const prev = events;
        setEvents((list) => list.filter((e) => e.id !== id));
        try {
            const res = await api(`/events/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
        } catch (e) {
            setEvents(prev);
            console.error(e);
        }
    }

    // ----------- Edit
    const startEdit = (e) => {
        setEditingId(e.id);
        setForm({
            name: e.name || "",
            place: e.place || "",
            date: toDateInput(e.date),          // <-- додали
            time: toTimeInput(e.date),          // <-- залишили/уніфікували
            price: e.price != null ? String(e.price) : "",
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm({ name: "", place: "", date: "", time: "", price: "" });
    };

    async function saveEdit(id) {
        const current = events.find((x) => x.id === id);
        if (!current) return;

        // Сформувати новий ISO з (нової або старої) дати й часу
        const desiredDate = form.date || toDateInput(current.date);
        const desiredTime = form.time || toTimeInput(current.date);
        const nextISO = composeISO(desiredDate, desiredTime);

        const payload = {
            name: form.name.trim(),
            place: form.place.trim(),
            price: form.price === "" ? null : (isNaN(Number(form.price)) ? form.price : Number(form.price)),
            date: nextISO,
        };

        const prev = events;
        setEvents((list) =>
            list.map((e) => (e.id === id ? { ...e, ...payload } : e))
        );

        try {
            const res = await api(`/events/${id}`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Patch failed");
            cancelEdit();
        } catch (e) {
            console.error(e);
            setEvents(prev);
        }
    }

    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Редагування подій</h1>
                <div className="flex gap-2">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Пошук за назвою, місцем, датою, ціною…"
                        className="h-11 w-72 max-w-full rounded-xl border px-3 outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button
                        onClick={fetchEvents}
                        className="h-11 rounded-xl border px-4 font-medium hover:bg-neutral-50"
                    >
                        Оновити
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border ring-1 ring-neutral-200 bg-white">
                <div className="max-h-[70vh] overflow-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-neutral-50/90 backdrop-blur">
                        <tr className="text-left">
                            <Th onClick={() => toggleSort("name")} sortable sort={sortBy} field="name">Назва</Th>
                            <Th onClick={() => toggleSort("date")} sortable sort={sortBy} field="date" w="220px">Дата/час</Th>
                            <Th onClick={() => toggleSort("place")} sortable sort={sortBy} field="place" w="220px">Місце</Th>
                            <Th onClick={() => toggleSort("price")} sortable sort={sortBy} field="price" w="120px">Ціна</Th>
                            <Th w="160px">Дії</Th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <RowsSkeleton />
                        ) : sorted.length === 0 ? (
                            <tr><td colSpan={5} className="p-6 text-center text-neutral-500">Нічого не знайдено</td></tr>
                        ) : (
                            sorted.map((e) => (
                                <tr key={e.id} className="border-t hover:bg-neutral-50">
                                    <Td>
                                        {editingId === e.id ? (
                                            <input
                                                value={form.name}
                                                onChange={(ev) => setForm((f) => ({ ...f, name: ev.target.value }))}
                                                className="w-full rounded-lg border px-2 py-1 outline-none focus:ring-2 focus:ring-red-500"
                                            />
                                        ) : (
                                            <div className="font-medium text-neutral-900">{e.name}</div>
                                        )}
                                    </Td>

                                    <Td>
                                        {editingId === e.id ? (
                                            <div className="flex flex-col gap-1">
                                                <input
                                                    type="date"
                                                    value={form.date}
                                                    onChange={(ev) => setForm((f) => ({ ...f, date: ev.target.value }))}
                                                    className="rounded-lg border px-2 py-1 outline-none focus:ring-2 focus:ring-red-500"
                                                />
                                                <input
                                                    type="time"
                                                    value={form.time}
                                                    onChange={(ev) => setForm((f) => ({ ...f, time: ev.target.value }))}
                                                    className="rounded-lg border px-2 py-1 outline-none focus:ring-2 focus:ring-red-500"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="text-neutral-900 font-medium">{fmtDate(e.date)}</div>
                                                <div className="text-neutral-500">{fmtTime(e.date)}</div>
                                            </>
                                        )}
                                    </Td>

                                    <Td title={e.place}>
                                        {editingId === e.id ? (
                                            <input
                                                value={form.place}
                                                onChange={(ev) => setForm((f) => ({ ...f, place: ev.target.value }))}
                                                className="w-full rounded-lg border px-2 py-1 outline-none focus:ring-2 focus:ring-red-500"
                                            />
                                        ) : (
                                            <div className="line-clamp-1">{e.place || "—"}</div>
                                        )}
                                    </Td>

                                    <Td>
                                        {editingId === e.id ? (
                                            <input
                                                inputMode="numeric"
                                                placeholder="грн"
                                                value={form.price}
                                                onChange={(ev) => setForm((f) => ({ ...f, price: ev.target.value }))}
                                                className="w-28 rounded-lg border px-2 py-1 outline-none focus:ring-2 focus:ring-red-500"
                                            />
                                        ) : (
                                            e.price != null && e.price !== "" ? `${e.price} грн` : "Безкоштовно"
                                        )}
                                    </Td>

                                    <Td>
                                        {editingId === e.id ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => saveEdit(e.id)}
                                                    className="rounded-lg bg-black px-3 py-1.5 text-white hover:bg-neutral-800"
                                                >
                                                    Зберегти
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="rounded-lg border px-3 py-1.5 hover:bg-neutral-50"
                                                >
                                                    Скасувати
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <a
                                                    href={`/events/${e.id}`}
                                                    className="rounded-lg border px-3 py-1.5 hover:bg-neutral-50"
                                                >
                                                    Переглянути
                                                </a>
                                                <button
                                                    onClick={() => startEdit(e)}
                                                    className="rounded-lg border px-3 py-1.5 hover:bg-neutral-50"
                                                >
                                                    Редагувати
                                                </button>
                                                <button
                                                    onClick={() => openConfirm(e.id)}
                                                    className="rounded-lg bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
                                                >
                                                    Видалити
                                                </button>
                                            </div>
                                        )}
                                    </Td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {confirm.open && (
                <ConfirmModal onClose={closeConfirm}>
                    <h3 className="text-lg font-semibold mb-2">Підтвердження видалення</h3>
                    <p className="text-sm text-neutral-600 mb-4">Видалити подію? Дію не можна скасувати.</p>
                    <div className="flex justify-end gap-2">
                        <button className="rounded-xl border px-3 py-2 text-sm" onClick={closeConfirm}>Скасувати</button>
                        <button className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700" onClick={deleteConfirmed}>
                            Видалити
                        </button>
                    </div>
                </ConfirmModal>
            )}
        </div>
    );
}

// ---------- Small UI helpers ----------
function Th({ children, w, sortable, sort, field, onClick }) {
    const active = sortable && sort.key === field;
    const arrow = !sortable ? null : active ? (sort.dir === "asc" ? " ↑" : " ↓") : " ↕";
    return (
        <th
            style={{ width: w }}
            onClick={onClick}
            className={`px-4 py-3 ${sortable ? "cursor-pointer select-none" : ""}`}
            title={sortable ? "Сортувати" : undefined}
        >
            <span className={active ? "font-semibold" : ""}>{children}{arrow}</span>
        </th>
    );
}
function Td({ children }) { return <td className="px-4 py-3 align-top">{children}</td>; }

function RowsSkeleton() {
    return (
        <>
            {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-t">
                    {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                            <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

function ConfirmModal({ children, onClose }) {
    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose]);

    const modal = (
        <div className="fixed inset-0 z-[1000]">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="absolute inset-0 grid place-items-center p-4">
                <div
                    className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
