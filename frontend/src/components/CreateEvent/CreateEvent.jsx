import {useState} from "react";

export default function CreateEvent() {
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [place, setPlace] = useState("");
    const [image, setImage] = useState("");


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
            <input type="text" placeholder="Enter event name" onInput={(e) => setName(e.target.value)}/>
            <input type="text" placeholder="Enter event date" onInput={(e) => setDate(e.target.value)}/>
            <input type="text" placeholder="Enter event place" onInput={(e) => setPlace(e.target.value)}/>
            <input type="text" placeholder="Enter event photo adress" onInput={(e) => setImage(e.target.value)}/>
            <button onClick={handleOnSubmitClick} className="bg-amber-400 m-14">Submit</button>
        </>
    )
}