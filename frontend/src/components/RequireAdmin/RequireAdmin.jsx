import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

export default function RequireAdmin({children}) {
    const navigate = useNavigate();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        fetch("http://localhost:3001/me", {
            headers: { Authorization: "Bearer " + token }
        })
            .then(res => res.json())
            .then(data => {
                if (!data.isAdmin) {
                    navigate("/");
                } else {
                    setIsVerified(true);
                }
            })
            .catch(() => navigate("/"));
    }, []);

    if (isVerified === null) {
        return <div className="text-white p-4">Checking permissions...</div>;
    }

    return children;
}
