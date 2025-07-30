import {Link} from "react-router-dom";

export default function EventCard(props) {
    return (
        <Link to={`/events/${props.id}`}>
            <div className="w-72 h-96 bg-white rounded-3xl  p-4 flex flex-col shadow-[0_5px_20px_rgba(0,0,0,0.35)] justify-between hover:scale-105 transition-transform duration-300">
                <div className="w-full h-[60%] rounded-2xl overflow-hidden">
                    <img
                        src={props.image}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                </div>
                <h2 className="text-xl font-bold text-black text-center mt-3">
                    {props.name}
                </h2>
                <button
                    className="mt-2 bg-black text-white py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                    Переглянути
                </button>
            </div>
        </Link>

    );
}
