import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://192.168.1.52:3001";

// --- helpers ---
function parseJwt(token) {
    try {
        const [, payload] = token.split(".");
        return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    } catch {
        return null;
    }
}
function isExpired(token) {
    const p = parseJwt(token);
    if (!p?.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    // невеликий буфер на годинники/мережу
    return p.exp < now + 5;
}

export default function RequireAdmin({ children }) {
    const navigate = useNavigate();
    const [status, setStatus] = useState("checking"); // 'checking' | 'ok'
    const aborted = useRef(false);

    useEffect(() => {
        aborted.current = false;

        const run = async () => {
            const token = localStorage.getItem("token");

            // 1) нема токена — на головну
            if (!token) {
                navigate("/");
                return;
            }

            // 2) токен протух — пробуємо оновити, або логутаут
            if (isExpired(token)) {
                const refreshed = await tryRefreshToken();
                if (!refreshed) {
                    localStorage.removeItem("token");
                    navigate("/");
                    return;
                }
            }

            // 3) перевіряємо /me
            const ok = await checkMe();
            if (!ok) {
                // остання спроба: можливо токен став невалідним між часом перевірок
                const refreshed = await tryRefreshToken();
                if (refreshed) {
                    const ok2 = await checkMe();
                    if (ok2) {
                        if (!aborted.current) setStatus("ok");
                        return;
                    }
                }
                navigate("/");
                return;
            }

            if (!aborted.current) setStatus("ok");
        };

        run();

        return () => {
            aborted.current = true;
        };
    }, [navigate]);

    // запит до /me із захистом від не-ok
    async function checkMe() {
        const token = localStorage.getItem("token");
        if (!token) return false;

        try {
            const res = await fetch(`${API}/me`, {
                headers: {
                    Authorization: "Bearer " + token,
                    Accept: "application/json",
                },
            });
            if (!res.ok) return false;

            const data = await res.json().catch(() => ({}));
            const isAdmin = data.isAdmin ?? data.is_admin ?? false;
            return !!isAdmin;
        } catch {
            return false;
        }
    }

    // опційний рефреш (працює лише якщо такий ендпоїнт є; інакше завжди false)
    async function tryRefreshToken() {
        try {
            const res = await fetch(`${API}/refresh`, { method: "POST", credentials: "include" });
            if (!res.ok) return false;
            const data = await res.json().catch(() => ({}));
            if (data?.token) {
                localStorage.setItem("token", data.token);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }

    // поки перевіряємо — нічого не рендеримо (щоб не було 403 у консолі та мерехтіння)
    if (status !== "ok") return null;

    return children;
}
