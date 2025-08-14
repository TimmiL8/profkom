import React, { useEffect, useRef, useState } from "react";

const apiBase = "http://192.168.1.52:3001";

export default function CreateEvent() {
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [place, setPlace] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    // auth
    const [jwt, setJwt] = useState("");

    const fileInputRef = useRef(null);
    const pasteZoneRef = useRef(null);

    // ---- Helpers
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Санітизація ціни: лише цифри, одна крапка/кома, до 2 знаків після
    function sanitizePrice(input) {
        if (typeof input !== "string") input = String(input ?? "");
        let s = input.replace(",", ".");           // кома -> крапка
        s = s.replace(/[^\d.]/g, "");              // прибрати все, крім цифр та крапки

        // дозволити лише одну крапку
        const parts = s.split(".");
        if (parts.length > 2) {
            s = parts[0] + "." + parts.slice(1).join("");
        }

        // обмежити 2 знаками після крапки
        const [intPart, fracPart] = s.split(".");
        if (fracPart !== undefined) {
            s = intPart + "." + fracPart.slice(0, 2);
        }

        // не дозволяти самотню крапку
        if (s === ".") s = "";

        return s;
    }

    // ---- Load token from storage on mount
    useEffect(() => {
        const fromStorage =
            localStorage.getItem("jwt") ||
            localStorage.getItem("token") ||
            sessionStorage.getItem("jwt") ||
            sessionStorage.getItem("token") ||
            "";
        if (fromStorage) setJwt(fromStorage);
    }, []);

    // ---- Persist token when user edits
    useEffect(() => {
        if (jwt) localStorage.setItem("jwt", jwt);
    }, [jwt]);

    // ---- Quick token check
    useEffect(() => {
        if (!jwt) return;
        fetch(`${apiBase}/me`, { headers: { Authorization: `Bearer ${jwt}` } })
            .then(r => r.json())
            .then(d => {
                if (d?.error) setMessage(`JWT помилка: ${d.error}`);
            })
            .catch(() => {});
    }, [jwt]);

    async function handleImageUpload(e) {
        const file = e.target?.files?.[0];
        if (!file) return;
        const dataUrl = await readFileAsDataURL(file);
        setImage(dataUrl);
    }

    async function handlePaste(e) {
        const items = e.clipboardData?.items || [];
        for (const it of items) {
            if (it.type && it.type.startsWith("image/")) {
                e.preventDefault();
                const file = it.getAsFile();
                if (file) {
                    const dataUrl = await readFileAsDataURL(file);
                    setImage(dataUrl);
                    setMessage("Зображення вставлено з буфера обміну");
                }
                return;
            }
        }
    }

    function handlePriceChange(e) {
        const cleaned = sanitizePrice(e.target.value);
        setPrice(cleaned);
    }

    function handlePriceKeyDown(e) {
        // Заборонити будь-що, крім цифр, крапки/коми, службових клавіш і комбінацій Ctrl/Cmd+A/C/V/X
        const allowedNav = ["Backspace","Delete","ArrowLeft","ArrowRight","Home","End","Tab"];
        if (allowedNav.includes(e.key)) return;

        const isCtrlCmd = e.ctrlKey || e.metaKey;
        if (isCtrlCmd && ["a","c","v","x"].includes(e.key.toLowerCase())) return;

        if (e.key >= "0" && e.key <= "9") return;

        if (e.key === "." || e.key === ",") {
            if (price.includes(".") || price.includes(",")) {
                e.preventDefault();
            }
            return;
        }

        e.preventDefault();
    }

    async function handleOnSubmitClick() {
        setMessage("");

        if (!name || !date || !place || !image) {
            setMessage("Заповни назву, дату, місце і додай фото");
            return;
        }
        // Фінальна перевірка ціни (за потреби — порожнє значення допустиме)
        if (price && !/^\d+(\.\d{1,2})?$/.test(price)) {
            setMessage("Ціна має містити лише цифри (до 2 знаків після коми)");
            return;
        }

        if (!jwt) {
            setMessage("Потрібен JWT: увійди або встав токен у поле нижче");
            return;
        }

        try {
            setSubmitting(true);
            const isoDate = new Date(`${date}T${time || "00:00"}`).toISOString();

            const res = await fetch(`${apiBase}/events`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt}`,
                },
                body: JSON.stringify({
                    name,
                    date: isoDate,
                    place,
                    price, // вже санітайзена строка (наприклад "150" або "99.90")
                    description,
                    image,
                }),
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(`Server error (${res.status}) ${text}`);
            }

            const data = await res.json();
            console.log("Event added:", data);
            setMessage("Подію створено ✅");

            setName("");
            setDate("");
            setTime("");
            setPlace("");
            setPrice("");
            setDescription("");
            setImage("");
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            console.error("POST failed:", err);
            setMessage(String(err?.message || "Помилка під час створення події"));
        } finally {
            setSubmitting(false);
        }
    }

    const authOk = Boolean(jwt);

    return (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-red-600">Створити захід</h1>

                <span
                    className={
                        "text-xs px-3 py-1 rounded-full border " +
                        (authOk
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200")
                    }
                    title={authOk ? "JWT знайдено" : "JWT відсутній"}
                >
          {authOk ? "Авторизовано" : "Не авторизовано"}
        </span>
            </div>

            {/* JWT input */}
            <div className="mb-8">
                <label className="block">
                    <div className="mb-1 text-sm text-gray-700">JWT (Bearer)</div>
                    <input
                        type="text"
                        value={jwt}
                        onChange={(e) => setJwt(e.target.value.trim())}
                        placeholder="Встав сюди токен після /login (без слова Bearer)"
                        className="w-full h-10 rounded-lg bg-gray-100 px-3 outline-none focus:ring-2 focus:ring-red-500"
                    />
                </label>
                <p className="text-xs text-gray-500 mt-1">
                    Токен збережеться у <code>localStorage["jwt"]</code>.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* LEFT — form */}
                <div className="space-y-5">
                    <Field label="назва заходу">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-10 rounded-lg bg-gray-100 px-3 outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="дата">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full h-10 rounded-lg bg-gray-100 px-3 outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </Field>
                        <Field label="час">
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full h-10 rounded-lg bg-gray-100 px-3 outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </Field>
                    </div>

                    <Field label="місце/адреса">
                        <input
                            type="text"
                            value={place}
                            onChange={(e) => setPlace(e.target.value)}
                            className="w-full h-10 rounded-lg bg-gray-100 px-3 outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </Field>

                    <Field label="ціна">
                        <input
                            type="text"
                            inputMode="decimal"
                            pattern="^\d+([.,]\d{1,2})?$"
                            placeholder="наприклад: 150 або 99,99"
                            value={price}
                            onChange={handlePriceChange}
                            onKeyDown={handlePriceKeyDown}
                            className="w-full h-10 rounded-lg bg-gray-100 px-3 outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Лише цифри, можна крапку/кому, до 2 знаків після.
                        </p>
                    </Field>

                    <Field label="опис заходу">
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-lg bg-gray-100 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                            rows={4}
                        />
                    </Field>

                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                        <label className="flex-1 flex flex-col items-center justify-center border bg-white rounded-xl shadow px-6 py-5 cursor-pointer hover:shadow-md">
                            <span className="text-3xl leading-none">↓</span>
                            <span className="text-base font-medium">Завантажити фото</span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </label>

                        <div
                            ref={pasteZoneRef}
                            onPaste={handlePaste}
                            tabIndex={0}
                            className="flex-1 rounded-xl border border-dashed px-4 py-5 text-center text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                            title="Сфокусуй поле і натисни Ctrl/⌘+V, щоб вставити зображення"
                        >
                            Вставити фото (Ctrl/⌘+V)
                        </div>
                    </div>

                    <button
                        onClick={handleOnSubmitClick}
                        disabled={submitting}
                        className="w-full sm:w-auto mt-6 bg-black text-white font-semibold py-3 px-8 rounded-xl hover:bg-neutral-800 disabled:opacity-60"
                    >
                        {submitting ? "Надсилаю..." : "ГОТОВО"}
                    </button>

                    {message && <p className="text-sm text-gray-700 pt-2">{message}</p>}
                </div>

                {/* RIGHT — live preview */}
                <aside className="order-first md:order-none">
                    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-2">{name || "Назва заходу"}</h2>
                            <p className="text-sm text-gray-600 mb-4">
                                {date || "дата"} • {time || "час"} • {place || "місце"} • {price || "ціна"}
                            </p>
                            {description && <p className="text-sm text-gray-700 mb-4">{description}</p>}
                            <div className="aspect-[4/3] w-full bg-gray-100 rounded-xl overflow-hidden">
                                {image ? (
                                    <img src={image} alt="превʼю" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full grid place-items-center text-gray-400">
                                        Без зображення
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <label className="block">
            <div className="mb-1 text-sm text-gray-700">{label}</div>
            {children}
        </label>
    );
}
