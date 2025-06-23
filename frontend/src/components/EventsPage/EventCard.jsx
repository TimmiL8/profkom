export default function EventCard(props) {
    return (
        <div className="w-72 h-96 bg-gray-600 border-4 rounded-2xl overflow-hidden flex flex-col">
            <div className="flex-[2]">
                <img src={props.image} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-[1] p-2 text-white flex flex-col justify-between">
                <h2 className="text-center font-bold text-xl">{props.name}</h2>
                <div className="text-sm">
                    <p>date: {props.date}</p>
                    <p>place: {props.place}</p>
                </div>
            </div>
        </div>
    );
}
