import { useState } from "react";

export default function CreateEvent() {
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [place, setPlace] = useState("");
    const [image, setImage] = useState("");

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result); // base64 string
            };
            reader.readAsDataURL(file);
        }
    }

    async function handleOnSubmitClick() {
        if (name && date && place && image) {
            try {
                const response = await fetch('http://localhost:3001/events', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        date: date,
                        place: place,
                        image: image
                    })
                });

                if (!response.ok) throw new Error("Server error");
                const data = await response.json();
                console.log("Event added:", data);
            } catch (err) {
                console.error("POST failed:", err);
            }
        } else {
            console.log("not enough info");
        }
    }

    return (
        <>
            <h1 className="text-3xl font-bold text-red-600 mb-10 font-normal mt-8">Створити захід</h1>
            <div className="flex flex-col gap-5 items-center">
                <div className="flex gap-2 flex-col">
                    <label>назва заходу</label>
                    <input
                        type="text"
                        placeholder=""
                        onInput={(e) => setName(e.target.value)}
                        className="w-60 h-8 bg-gray-200 border-none rounded"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label>дата</label>
                    <input
                        type="date"
                        placeholder=""
                        onInput={(e) => setDate(e.target.value)}
                        className="w-60 h-8 bg-gray-200 border-none rounded"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label>час</label>
                    <input
                        type="time"
                        placeholder=""
                        onInput={(e) => setTime(e.target.value)}
                        className="w-60 h-8 bg-gray-200 border-none rounded"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label>місце/адреса</label>
                    <input
                        type="text"
                        placeholder=""
                        onInput={(e) => setPlace(e.target.value)}
                        className="w-60 h-8 bg-gray-200 border-none rounded"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label>ціна</label>
                    <input
                        type="text"
                        placeholder=""
                        onInput={(e) => setPrice(e.target.value)}
                        className="w-60 h-8 bg-gray-200 border-none rounded"
                    />
                </div>

                <label className="mt-10 w-3xs flex flex-col items-center justify-center border bg-white rounded-xl shadow-lg px-6 py-4 cursor-pointer hover:shadow-xl">
                    <span className="text-3xl">↓</span>
                    <span className="text-xl font-medium">завантажити фото</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>

                <button
                    onClick={handleOnSubmitClick}
                    className="mt-10 bg-black text-white font-bold py-4 px-10 rounded-xl hover:bg-neutral-800 m-auto mb-4"
                >
                    ГОТОВО
                </button>
            </div>
        </>

    )
}
