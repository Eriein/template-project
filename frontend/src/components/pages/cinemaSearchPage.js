import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL =
    process.env.REACT_APP_BACKEND_SERVER_URI || "http://localhost:8081";

/* ─── Keyframe injection ─────────────────────────────────────────── */
const injectStyles = () => {
    if (document.getElementById("cinema-search-styles")) return;
    const style = document.createElement("style");
    style.id = "cinema-search-styles";
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,300&display=swap');

        @keyframes grain {
            0%, 100% { transform: translate(0,0); }
            10%  { transform: translate(-2%,-3%); }
            30%  { transform: translate(3%,2%); }
            50%  { transform: translate(-1%,4%); }
            70%  { transform: translate(4%,-1%); }
            90%  { transform: translate(-3%,1%); }
        }
        @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(28px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
            0%   { background-position: -700px 0; }
            100% { background-position:  700px 0; }
        }
        @keyframes scanline {
            0%   { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
        }
        @keyframes tickerScroll {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
        }
        @keyframes inputGlow {
            0%,100% { box-shadow: 0 0 0 0 rgba(255,220,80,0); }
            50%      { box-shadow: 0 0 20px 2px rgba(255,220,80,0.12); }
        }
        @keyframes pulseSearch {
            0%,100% { box-shadow: 0 14px 32px rgba(255,180,0,0.2); }
            50%      { box-shadow: 0 14px 44px rgba(255,180,0,0.38); }
        }

        .cinema-search-page * { box-sizing: border-box; }
        .cinema-search-page { font-family: 'DM Sans', sans-serif; }

        /* Grain overlay */
        .cinema-search-page::after {
            content: '';
            position: fixed;
            inset: -50%;
            width: 200%; height: 200%;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
            opacity: 0.035;
            pointer-events: none;
            animation: grain 8s steps(10) infinite;
            z-index: 9999;
        }

        .scanline-bar {
            position: fixed; left: 0; right: 0; height: 2px;
            background: linear-gradient(transparent, rgba(255,220,80,0.06), transparent);
            pointer-events: none;
            animation: scanline 8s linear infinite;
            z-index: 9998;
        }

        /* Film strip */
        .film-strip-left  { position: fixed; top: 0; bottom: 0; left:  0; }
        .film-strip-right { position: fixed; top: 0; bottom: 0; right: 0; }

        /* Search input focus */
        .zip-input:focus {
            outline: none;
            border-color: rgba(255,220,80,0.45) !important;
            background: rgba(255,220,80,0.06) !important;
            animation: inputGlow 2s ease infinite;
        }
        .zip-input::placeholder { color: rgba(255,255,255,0.28); }

        /* Search button */
        .search-btn {
            animation: pulseSearch 3s ease infinite;
            transition: transform 0.2s ease, filter 0.2s ease !important;
        }
        .search-btn:hover:not(:disabled) {
            transform: translateY(-2px) scale(1.03) !important;
            filter: brightness(1.12);
        }
        .search-btn:active:not(:disabled) {
            transform: scale(0.97) !important;
        }
        .search-btn:disabled {
            opacity: 0.6; cursor: not-allowed;
            animation: none !important;
        }

        /* Cinema card */
        .cinema-card {
            transition: transform 0.35s cubic-bezier(.22,.68,0,1.2),
                        box-shadow 0.35s ease,
                        border-color 0.3s ease;
            animation: fadeSlideUp 0.55s ease both;
        }
        .cinema-card:hover {
            transform: translateY(-6px) scale(1.012) !important;
            box-shadow: 0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,220,80,0.2) !important;
            border-color: rgba(255,220,80,0.25) !important;
        }
        .cinema-card:hover .logo-img {
            transform: scale(1.06);
        }

        /* View button */
        .view-btn {
            transition: all 0.22s cubic-bezier(.22,.68,0,1.2);
        }
        .view-btn:hover {
            background: #ffd84f !important;
            color: #0d0d14 !important;
            transform: translateY(-2px);
            box-shadow: 0 10px 28px rgba(255,216,79,0.4) !important;
        }

        /* Skeleton shimmer */
        .skeleton-shimmer {
            background: linear-gradient(
                90deg,
                rgba(255,255,255,0.06) 25%,
                rgba(255,255,255,0.12) 50%,
                rgba(255,255,255,0.06) 75%
            );
            background-size: 700px 100%;
            animation: shimmer 1.8s infinite;
        }

        /* Ticker */
        .ticker-inner {
            display: flex; gap: 0;
            animation: tickerScroll 28s linear infinite;
            width: max-content;
        }
        .ticker-inner:hover { animation-play-state: paused; }

        /* Card stagger */
        .cinema-card:nth-child(1) { animation-delay: 0.05s; }
        .cinema-card:nth-child(2) { animation-delay: 0.12s; }
        .cinema-card:nth-child(3) { animation-delay: 0.19s; }
        .cinema-card:nth-child(4) { animation-delay: 0.26s; }
        .cinema-card:nth-child(5) { animation-delay: 0.33s; }
        .cinema-card:nth-child(6) { animation-delay: 0.40s; }

        .logo-img { transition: transform 0.5s ease; display: block; }
        .logo-wrap { overflow: hidden; border-radius: 12px; }

        .section-reveal { animation: fadeSlideUp 0.6s ease both; }

        .gold-divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255,220,80,0.4), transparent);
            margin: 0; border: none;
        }

        /* Favourites drawer */
        @keyframes drawerIn {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes drawerOut {
            from { transform: translateX(0);    opacity: 1; }
            to   { transform: translateX(100%); opacity: 0; }
        }
        @keyframes overlayIn {
            from { opacity: 0; }
            to   { opacity: 1; }
        }
        .fav-drawer {
            animation: drawerIn 0.38s cubic-bezier(.22,.68,0,1.1) forwards;
        }
        .fav-drawer.closing {
            animation: drawerOut 0.3s ease forwards;
        }
        .fav-overlay {
            animation: overlayIn 0.3s ease forwards;
        }
        .fav-entry-btn {
            transition: all 0.22s ease !important;
        }
        .fav-entry-btn:hover {
            border-color: rgba(255,80,100,0.5) !important;
            background: rgba(255,80,100,0.1) !important;
            transform: scale(1.04);
        }
        .fav-entry-btn.has-favs {
            border-color: rgba(255,80,100,0.35) !important;
            background: rgba(255,80,100,0.08) !important;
        }
        .drawer-cinema-row {
            transition: background 0.2s ease, border-color 0.2s ease;
            cursor: pointer;
        }
        .drawer-cinema-row:hover {
            background: rgba(255,220,80,0.06) !important;
            border-color: rgba(255,220,80,0.2) !important;
        }
        .drawer-remove-btn {
            transition: all 0.18s ease;
            opacity: 0;
        }
        .drawer-cinema-row:hover .drawer-remove-btn {
            opacity: 1 !important;
        }
        .drawer-remove-btn:hover {
            background: rgba(255,80,100,0.2) !important;
            color: #ff6b6b !important;
        }
        @keyframes rowFadeIn {
            from { opacity: 0; transform: translateX(12px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        .drawer-row-anim {
            animation: rowFadeIn 0.3s ease both;
        }
    `;
    document.head.appendChild(style);
};

/* ─── Film Strip ─────────────────────────────────────────────────── */
const FilmStrip = ({ side }) => (
    <div style={{
        position: "fixed", top: 0, bottom: 0,
        [side]: 0,
        width: 28,
        background: "rgba(0,0,0,0.5)",
        borderRight: side === "left" ? "1px solid rgba(255,255,255,0.04)" : "none",
        borderLeft: side === "right" ? "1px solid rgba(255,255,255,0.04)" : "none",
        display: "flex", flexDirection: "column",
        justifyContent: "space-around", alignItems: "center",
        padding: "12px 0", zIndex: 1, pointerEvents: "none",
    }}>
        {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} style={{
                width: 10, height: 8, borderRadius: 2,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.04)",
            }} />
        ))}
    </div>
);

/* ─── Ticker ─────────────────────────────────────────────────────── */
const Ticker = () => {
    const items = ["FIND YOUR CINEMA", "SEARCH BY ZIP CODE", "NOW SHOWING NEAR YOU", "BOOK YOUR SEATS", "FIND YOUR CINEMA", "SEARCH BY ZIP CODE", "NOW SHOWING NEAR YOU", "BOOK YOUR SEATS"];
    return (
        <div style={{ overflow: "hidden", borderTop: "1px solid rgba(255,220,80,0.15)", borderBottom: "1px solid rgba(255,220,80,0.15)", padding: "10px 0", marginBottom: "36px" }}>
            <div className="ticker-inner">
                {[...items, ...items].map((t, i) => (
                    <span key={i} style={{ whiteSpace: "nowrap", padding: "0 28px", fontSize: 11, fontWeight: 700, letterSpacing: "3px", color: i % 2 === 0 ? "rgba(255,220,80,0.7)" : "rgba(255,255,255,0.25)" }}>
                        {t} {i % 2 === 0 ? "✦" : "·"}
                    </span>
                ))}
            </div>
        </div>
    );
};

/* ─── Favourites Drawer ──────────────────────────────────────────── */
const FavouritesDrawer = ({ onClose, onNavigate }) => {
    const [favs, setFavs] = useState([]);
    const [closing, setClosing] = useState(false);

    const user =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(localStorage.getItem("userInfo")) ||
        {};

    const currentUserId = user?.id || user?._id || user?.userId || "user12345";

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/favorites/${currentUserId}`);
                if (!response.ok) return;

                const data = await response.json();

                const mapped = Array.isArray(data)
                    ? data.map((item) => ({
                        id: item.cinemaId,
                        name: item.cinemaName,
                        address: item.address || "",
                    }))
                    : [];

                setFavs(mapped);
            } catch (err) {
                console.error("Fetch favorites error:", err);
            }
        };

        fetchFavorites();
    }, [currentUserId]);

    const handleClose = () => {
        setClosing(true);
        setTimeout(onClose, 300);
    };

    const handleRemove = async (e, id) => {
        e.stopPropagation();

        try {
            const response = await fetch(
                `${BACKEND_URL}/favorites/${currentUserId}/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Failed to remove favorite");
            }

            setFavs((prev) => prev.filter((f) => String(f.id) !== String(id)));
        } catch (err) {
            console.error("Remove favorite error:", err);
            alert(err.message || "Failed to remove favorite");
        }
    };

    const handleGo = (cinema) => {
        handleClose();
        setTimeout(() => onNavigate(cinema.id, cinema.name), 320);
    };

    return (
        <>
            <div
                className="fav-overlay"
                onClick={handleClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(4px)",
                    zIndex: 3000,
                }}
            />

            <div
                className={`fav-drawer${closing ? " closing" : ""}`}
                style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: "min(420px, 92vw)",
                    background: "#0e0e1a",
                    borderLeft: "1px solid rgba(255,255,255,0.08)",
                    zIndex: 3001,
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "-24px 0 80px rgba(0,0,0,0.6)",
                }}
            >
                <div
                    style={{
                        padding: "24px 24px 20px",
                        borderBottom: "1px solid rgba(255,255,255,0.07)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: "3px",
                                color: "rgba(255,80,100,0.7)",
                                marginBottom: 6,
                            }}
                        >
                            MY COLLECTION
                        </div>
                        <h2
                            style={{
                                margin: 0,
                                fontFamily: "'Bebas Neue', sans-serif",
                                fontSize: "1.9rem",
                                letterSpacing: "2px",
                                color: "#fff",
                            }}
                        >
                            Saved Cinemas
                        </h2>
                    </div>

                    <button
                        onClick={handleClose}
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(255,255,255,0.05)",
                            color: "rgba(255,255,255,0.6)",
                            cursor: "pointer",
                            fontSize: 18,
                            lineHeight: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "'DM Sans', sans-serif",
                            transition: "all 0.2s ease",
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div
                    style={{
                        padding: "10px 24px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                    }}
                >
                    <span
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background:
                                favs.length > 0
                                    ? "rgba(255,80,100,0.12)"
                                    : "rgba(255,255,255,0.05)",
                            border: `1px solid ${favs.length > 0
                                ? "rgba(255,80,100,0.3)"
                                : "rgba(255,255,255,0.08)"
                                }`,
                            color:
                                favs.length > 0
                                    ? "#ff6b6b"
                                    : "rgba(255,255,255,0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 800,
                        }}
                    >
                        {favs.length}
                    </span>
                    <span
                        style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.35)",
                            letterSpacing: "0.3px",
                        }}
                    >
                        {favs.length === 1 ? "cinema saved" : "cinemas saved"}
                    </span>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px" }}>
                    {favs.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 20px" }}>
                            <div style={{ fontSize: "2.8rem", marginBottom: 14, opacity: 0.4 }}>
                                ❤️
                            </div>
                            <p
                                style={{
                                    fontFamily: "'Bebas Neue', sans-serif",
                                    fontSize: "1.4rem",
                                    letterSpacing: "2px",
                                    color: "rgba(255,255,255,0.35)",
                                    margin: "0 0 8px",
                                }}
                            >
                                No Saved Cinemas
                            </p>
                            <p
                                style={{
                                    fontSize: 13,
                                    color: "rgba(255,255,255,0.25)",
                                    lineHeight: 1.7,
                                    margin: 0,
                                }}
                            >
                                Browse cinemas and tap the ❤️ button to save your favourites here.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {favs.map((cinema, idx) => (
                                <div
                                    key={cinema.id}
                                    className="drawer-cinema-row drawer-row-anim"
                                    onClick={() => handleGo(cinema)}
                                    style={{
                                        position: "relative",
                                        padding: "14px 16px",
                                        borderRadius: 12,
                                        border: "1px solid rgba(255,255,255,0.07)",
                                        background: "rgba(255,255,255,0.03)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 14,
                                        animationDelay: `${idx * 0.06}s`,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 8,
                                            flexShrink: 0,
                                            background: "rgba(255,80,100,0.1)",
                                            border: "1px solid rgba(255,80,100,0.2)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 15,
                                        }}
                                    >
                                        ❤️
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontSize: "0.95rem",
                                                fontWeight: 700,
                                                color: "#f0ece0",
                                                marginBottom: 3,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {cinema.name}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: "rgba(255,255,255,0.3)",
                                                letterSpacing: "1px",
                                            }}
                                        >
                                            ID: {cinema.id}
                                        </div>
                                    </div>

                                    <span
                                        style={{
                                            fontSize: 13,
                                            color: "rgba(255,220,80,0.5)",
                                            flexShrink: 0,
                                        }}
                                    >
                                        →
                                    </span>

                                    <button
                                        className="drawer-remove-btn"
                                        onClick={(e) => handleRemove(e, cinema.id)}
                                        title="Remove from favourites"
                                        style={{
                                            position: "absolute",
                                            top: 8,
                                            right: 8,
                                            width: 22,
                                            height: 22,
                                            borderRadius: 4,
                                            border: "none",
                                            background: "rgba(255,255,255,0.07)",
                                            color: "rgba(255,255,255,0.4)",
                                            cursor: "pointer",
                                            fontSize: 11,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontFamily: "'DM Sans', sans-serif",
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div
                    style={{
                        padding: "16px 24px",
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <span
                        style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.2)",
                            letterSpacing: "0.3px",
                        }}
                    >
                        ✦ Tap a cinema to view its listings
                    </span>
                </div>
            </div>
        </>
    );
};


const CinemaSearchPage = () => {
    const navigate = useNavigate();

    const [zipCode, setZipCode] = useState("");
    const [cinemas, setCinemas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageLoaded, setPageLoaded] = useState(false);
    const [error, setError] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [showFavDrawer, setShowFavDrawer] = useState(false);
    const [favCount, setFavCount] = useState(0);
    const [mapQuery, setMapQuery] = useState("");
    const [mapError, setMapError] = useState("");

    const user =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(localStorage.getItem("userInfo")) ||
        {};

    const currentUserId = user?.id || user?._id || user?.userId || "user12345";

    const searchCinemas = async (zip) => {
        if (!zip || !zip.trim()) { setError("Please enter a ZIP Code."); return; }
        setLoading(true); setError(""); setHasSearched(true);
        try {
            const response = await fetch(`${BACKEND_URL}/movieglu/nearby?zip=${encodeURIComponent(zip)}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to fetch nearby cinemas.");
            setCinemas(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Cinema search error:", err);
            setError(err.message || "Something went wrong while searching cinemas.");
            setCinemas([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        injectStyles();
        setTimeout(() => setPageLoaded(true), 60);

        const savedToken = localStorage.getItem("accessToken");
        const savedZipCode = localStorage.getItem("zipCode");
        if (savedToken && savedZipCode) {
            setIsLoggedIn(true);
            setZipCode(savedZipCode);
            searchCinemas(savedZipCode);
        }

        const fetchFavCount = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/favorites/${currentUserId}`);
                if (!response.ok) return;

                const data = await response.json();
                setFavCount(Array.isArray(data) ? data.length : 0);
            } catch (err) {
                console.error("Fetch favorite count error:", err);
            }
        };

        fetchFavCount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserId]);

    const handleSearch = () => searchCinemas(zipCode);
    const handleMapSearch = () => {
        const query = mapQuery.trim() || zipCode.trim();

        if (!query) {
            setMapError("Please enter a place, address, or ZIP Code for map search.");
            return;
        }

        setMapError("");
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
        window.open(mapsUrl, "_blank", "noopener,noreferrer");
    };

    const handleMapKeyDown = (e) => {
        if (e.key === "Enter") handleMapSearch();
    };
    const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(); };
    const handleViewMovies = (cinemaId, cinemaName) => {
        navigate(`/cinema/${cinemaId}`, { state: { cinemaName } });
    };
    const handleDrawerClose = async () => {
        setShowFavDrawer(false);

        try {
            const response = await fetch(`${BACKEND_URL}/favorites/${currentUserId}`);
            if (!response.ok) return;

            const data = await response.json();
            setFavCount(Array.isArray(data) ? data.length : 0);
        } catch (err) {
            console.error("Refresh favorite count error:", err);
        }
    };

    return (
        <div className="cinema-search-page" style={s.page}>
            <div className="scanline-bar" />
            <FilmStrip side="left" />
            <FilmStrip side="right" />

            {/* Favourites Drawer */}
            {showFavDrawer && (
                <FavouritesDrawer
                    onClose={handleDrawerClose}
                    onNavigate={handleViewMovies}
                />
            )}

            {/* Ambient orbs */}
            <div style={s.orbTopLeft} />
            <div style={s.orbTopRight} />
            <div style={s.orbBottomCenter} />

            <div style={{
                ...s.container,
                opacity: pageLoaded ? 1 : 0,
                transform: pageLoaded ? "none" : "translateY(24px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
            }}>

                {/* ── Header bar ── */}
                <header style={s.header} className="section-reveal">
                    <div style={s.logoMark}>✦ CINEMA</div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* Favourites entry button */}
                        <button
                            className={`fav-entry-btn${favCount > 0 ? " has-favs" : ""}`}
                            onClick={() => setShowFavDrawer(true)}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: 8,
                                padding: "8px 14px", borderRadius: 8,
                                border: "1px solid rgba(255,255,255,0.1)",
                                background: "rgba(255,255,255,0.04)",
                                color: "rgba(255,255,255,0.75)",
                                cursor: "pointer", fontSize: 13, fontWeight: 600,
                                letterSpacing: "0.5px",
                                fontFamily: "'DM Sans', sans-serif",
                                position: "relative",
                            }}
                        >
                            <span style={{ fontSize: 15 }}>❤️</span>
                            <span>Saved</span>
                            {favCount > 0 && (
                                <span style={{
                                    minWidth: 18, height: 18, borderRadius: 5,
                                    background: "#ff4b63",
                                    color: "#fff",
                                    fontSize: 10, fontWeight: 800,
                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                    padding: "0 4px",
                                    lineHeight: 1,
                                }}>
                                    {favCount}
                                </span>
                            )}
                        </button>

                        <div style={s.liveBadge}>
                            <span style={s.liveDot} />
                            LIVE SEARCH
                        </div>
                    </div>
                </header>

                {/* ── Hero ── */}
                <section style={s.hero} className="section-reveal">
                    <p style={s.eyebrow}>Movie Discovery</p>
                    <h1 style={s.heroTitle}>
                        Find Nearby<br />
                        <span style={s.heroTitleAccent}>Cinemas</span>
                    </h1>
                    <p style={s.heroSub}>
                        Enter your ZIP code and explore every cinema near you — showtimes, listings, and more.
                    </p>
                </section>

                {/* ── Search Box ── */}
                <section style={s.searchSection} className="section-reveal">
                    {isLoggedIn && zipCode && (
                        <div style={s.savedZipNotice}>
                            <span style={{ marginRight: 8, opacity: 0.7 }}>📍</span>
                            Using your saved ZIP Code: <strong style={{ color: "#ffd84f", marginLeft: 4 }}>{zipCode}</strong>
                        </div>
                    )}

                    <div style={s.searchBox}>
                        <div style={s.searchBoxLabel}>ZIP CODE</div>

                        <div style={s.searchRow}>
                            <div style={s.inputWrap}>
                                <span style={s.inputIcon}>📍</span>
                                <input
                                    className="zip-input"
                                    type="text"
                                    placeholder="e.g. 90210"
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    style={s.input}
                                />
                            </div>

                            <button
                                className="search-btn"
                                onClick={handleSearch}
                                style={s.searchBtn}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={s.spinner} />
                                        Searching
                                    </span>
                                ) : (
                                    <>Search Cinemas →</>
                                )}
                            </button>
                        </div>

                        {error && (
                            <div style={s.errorBox}>
                                <span style={{ marginRight: 8 }}>⚠</span>{error}
                            </div>
                        )}
                    </div>

                    <div style={s.mapSearchBox}>
                        <div style={s.mapSearchLabel}>MAP SEARCH</div>
                        <p style={s.mapSearchText}>
                            Search any place, address, or ZIP Code in Google Maps.
                        </p>

                        <div style={s.searchRow}>
                            <div style={s.inputWrap}>
                                <span style={s.inputIcon}>🗺️</span>
                                <input
                                    className="zip-input"
                                    type="text"
                                    placeholder="Search on map, e.g. AMC Boston Common or 02116"
                                    value={mapQuery}
                                    onChange={(e) => setMapQuery(e.target.value)}
                                    onKeyDown={handleMapKeyDown}
                                    style={s.input}
                                />
                            </div>

                            <button
                                className="search-btn"
                                onClick={handleMapSearch}
                                style={s.mapSearchBtn}
                            >
                                Open Map ↗
                            </button>
                        </div>

                        {mapError && (
                            <div style={s.errorBox}>
                                <span style={{ marginRight: 8 }}>⚠</span>{mapError}
                            </div>
                        )}
                    </div>
                </section>

                <hr className="gold-divider" />
                <Ticker />

                {/* ── Results ── */}
                <section>
                    <div style={s.resultsHead}>
                        <div>
                            <h2 style={s.resultsTitle}>Nearby Cinemas</h2>
                            <p style={s.resultsSub}>
                                {loading
                                    ? "Searching for cinemas near you…"
                                    : cinemas.length > 0
                                        ? `${cinemas.length} cinema${cinemas.length > 1 ? "s" : ""} found near ${zipCode}`
                                        : hasSearched ? "No results for this area" : "Enter a ZIP code to begin"}
                            </p>
                        </div>
                        {!loading && cinemas.length > 0 && (
                            <div style={s.countBadge}>{cinemas.length}</div>
                        )}
                    </div>

                    {loading ? (
                        <div style={s.grid}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={s.skeletonCard}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                                        <div style={{ flex: 1, marginRight: 16 }}>
                                            <div style={{ ...s.skeletonLine, width: "60%", height: 20, marginBottom: 14 }} className="skeleton-shimmer" />
                                            <div style={{ ...s.skeletonLine, width: "85%", height: 13, marginBottom: 10 }} className="skeleton-shimmer" />
                                            <div style={{ ...s.skeletonLine, width: "50%", height: 13, marginBottom: 16 }} className="skeleton-shimmer" />
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <div style={{ ...s.skeletonLine, width: 80, height: 30, borderRadius: 6 }} className="skeleton-shimmer" />
                                                <div style={{ ...s.skeletonLine, width: 90, height: 30, borderRadius: 6 }} className="skeleton-shimmer" />
                                            </div>
                                        </div>
                                        <div style={{ ...s.skeletonLine, width: 68, height: 68, borderRadius: 12, flexShrink: 0 }} className="skeleton-shimmer" />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                        <div style={{ ...s.skeletonLine, width: 130, height: 40, borderRadius: 8 }} className="skeleton-shimmer" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : cinemas.length === 0 ? (
                        <div style={s.emptyState}>
                            <div style={s.emptyIcon}>🎬</div>
                            <h3 style={s.emptyTitle}>
                                {hasSearched ? "No Cinemas Found" : "Ready to Explore"}
                            </h3>
                            <p style={s.emptyText}>
                                {isLoggedIn && hasSearched
                                    ? "We couldn't find cinemas for your saved ZIP Code. Try a different one."
                                    : hasSearched
                                        ? "No cinemas found in this area. Try a nearby ZIP code."
                                        : "Enter a ZIP code above to discover cinemas near you."}
                            </p>
                        </div>
                    ) : (
                        <div style={s.grid}>
                            {cinemas.map((cinema, idx) => (
                                <div key={cinema.id} className="cinema-card" style={s.cinemaCard}>
                                    {/* Index number */}
                                    <div style={s.cardNumber}>{String(idx + 1).padStart(2, "0")}</div>

                                    <div style={s.cardTop}>
                                        <div style={s.cardInfo}>
                                            <div style={s.cinemaTag}>CINEMA</div>
                                            <h3 style={s.cinemaName}>{cinema.name}</h3>
                                            <p style={s.cinemaAddress}>
                                                {cinema.address || "Address not available"}
                                            </p>
                                            <div style={s.metaRow}>
                                                <span style={s.metaChip}>
                                                    <span style={s.metaChipIcon}>📍</span>
                                                    {cinema.city || "Unknown city"}
                                                </span>
                                                <span style={s.metaChip}>
                                                    <span style={s.metaChipIcon}>📏</span>
                                                    {cinema.distance !== undefined && cinema.distance !== null
                                                        ? `${Number(cinema.distance).toFixed(1)} km`
                                                        : "—"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="logo-wrap">
                                            {cinema.logo ? (
                                                <img
                                                    className="logo-img"
                                                    src={cinema.logo}
                                                    alt={cinema.name}
                                                    style={s.logo}
                                                />
                                            ) : (
                                                <div style={s.logoPlaceholder}>🎥</div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={s.cardDivider} />

                                    <div style={s.cardBottom}>
                                        <div style={s.cardBottomLeft}>
                                            <span style={s.idLabel}>ID</span>
                                            <span style={s.idValue}>{cinema.id}</span>
                                        </div>
                                        <button
                                            className="view-btn"
                                            style={s.viewBtn}
                                            onClick={() => handleViewMovies(cinema.id, cinema.name)}
                                        >
                                            View Movies →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ── Footer ── */}
                <footer style={s.footer}>
                    <hr className="gold-divider" style={{ marginBottom: 24 }} />
                    <div style={s.footerInner}>
                        <span style={s.footerBrand}>✦ CINEMA</span>
                        <span style={s.footerNote}>Results based on your ZIP code location</span>
                    </div>
                </footer>

            </div>
        </div>
    );
};

/* ─── Styles ─────────────────────────────────────────────────────── */
const s = {
    page: {
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "#0c0c14",
        color: "#f0ece0",
        padding: "36px 64px 60px",
    },
    orbTopLeft: {
        position: "fixed", top: -160, left: -80,
        width: 420, height: 420, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,200,50,0.09) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
    },
    orbTopRight: {
        position: "fixed", top: -80, right: -100,
        width: 380, height: 380, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(180,80,255,0.07) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
    },
    orbBottomCenter: {
        position: "fixed", bottom: -200, left: "40%",
        width: 500, height: 300, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(255,200,50,0.04) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
    },

    container: {
        maxWidth: 1080, margin: "0 auto",
        position: "relative", zIndex: 2,
    },

    /* Header */
    header: {
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 48,
    },
    logoMark: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "1.3rem", letterSpacing: "4px",
        color: "rgba(255,220,80,0.55)",
    },
    liveBadge: {
        display: "flex", alignItems: "center", gap: 7,
        padding: "8px 14px", borderRadius: 6,
        border: "1px solid rgba(255,220,80,0.25)",
        background: "rgba(255,220,80,0.06)",
        color: "rgba(255,220,80,0.85)",
        fontSize: 11, fontWeight: 700, letterSpacing: "2px",
    },
    liveDot: {
        width: 6, height: 6, borderRadius: "50%",
        background: "#ffd84f", boxShadow: "0 0 8px #ffd84f",
    },

    /* Hero */
    hero: { marginBottom: 40 },
    eyebrow: {
        margin: "0 0 10px", fontSize: 11, fontWeight: 700,
        letterSpacing: "4px", color: "rgba(255,220,80,0.6)",
        textTransform: "uppercase",
    },
    heroTitle: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "clamp(3.5rem, 7vw, 6rem)",
        lineHeight: 0.92, margin: "0 0 20px",
        letterSpacing: "2px", color: "#ffffff",
    },
    heroTitleAccent: {
        background: "linear-gradient(135deg, #ffd84f 0%, #ffaa00 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    },
    heroSub: {
        margin: 0, maxWidth: 540,
        fontSize: "1.05rem", lineHeight: 1.75,
        color: "rgba(255,255,255,0.5)",
    },

    /* Search */
    searchSection: { marginBottom: 40 },
    savedZipNotice: {
        display: "inline-flex", alignItems: "center",
        marginBottom: 14, padding: "10px 16px",
        borderRadius: 8,
        background: "rgba(255,220,80,0.06)",
        border: "1px solid rgba(255,220,80,0.18)",
        color: "rgba(255,255,255,0.7)",
        fontSize: 13,
    },
    searchBox: {
        position: "relative",
        padding: "28px 28px 24px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
        marginBottom: 18,
    },
    searchBoxLabel: {
        position: "absolute", top: -10, left: 20,
        padding: "2px 10px", borderRadius: 4,
        background: "#ffd84f", color: "#0c0c14",
        fontSize: 10, fontWeight: 800, letterSpacing: "3px",
    },
    mapSearchText: {
        margin: "0 0 16px",
        color: "rgba(255,255,255,0.5)",
        fontSize: 14,
        lineHeight: 1.6,
    },
    searchRow: {
        display: "flex", gap: 12, flexWrap: "wrap",
    },
    inputWrap: {
        flex: "1 1 260px", position: "relative",
        display: "flex", alignItems: "center",
    },
    inputIcon: {
        position: "absolute", left: 16, fontSize: 16,
        pointerEvents: "none", zIndex: 1,
    },
    input: {
        width: "100%", minHeight: 54,
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.06)",
        color: "#ffffff", fontSize: "1rem",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500, paddingLeft: 44, paddingRight: 16,
        transition: "all 0.25s ease",
    },
    searchBtn: {
        minWidth: 180, minHeight: 54,
        border: "none", borderRadius: 10,
        cursor: "pointer", fontSize: "0.95rem",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 700, letterSpacing: "0.3px",
        color: "#0c0c14",
        background: "linear-gradient(135deg, #ffd84f 0%, #ffaa00 100%)",
        flexShrink: 0,
    },
    mapSearchBtn: {
        minWidth: 180,
        minHeight: 54,
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
        fontSize: "0.95rem",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 700,
        letterSpacing: "0.3px",
        color: "#0c0c14",
        background: "linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%)",
        flexShrink: 0,
    },
    spinner: {
        display: "inline-block",
        width: 14, height: 14,
        border: "2px solid rgba(12,12,20,0.3)",
        borderTop: "2px solid #0c0c14",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },
    errorBox: {
        marginTop: 16, padding: "13px 16px",
        borderRadius: 8,
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.2)",
        color: "#fca5a5", fontSize: 14,
        display: "flex", alignItems: "center",
    },

    /* Results header */
    resultsHead: {
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-end", marginBottom: 24,
    },
    resultsTitle: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "2.2rem", letterSpacing: "2px",
        margin: 0, color: "#fff",
    },
    resultsSub: {
        margin: "4px 0 0", fontSize: 13,
        color: "rgba(255,255,255,0.4)", letterSpacing: "0.3px",
    },
    countBadge: {
        width: 40, height: 40, borderRadius: 8,
        background: "rgba(255,220,80,0.1)",
        border: "1px solid rgba(255,220,80,0.25)",
        color: "#ffd84f",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, fontWeight: 800,
    },

    /* Grid */
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 20,
    },

    /* Cinema card */
    cinemaCard: {
        position: "relative", padding: "24px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
        overflow: "hidden",
    },
    cardNumber: {
        position: "absolute", top: 16, right: 18,
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "3rem", lineHeight: 1,
        color: "rgba(255,255,255,0.05)",
        letterSpacing: "1px", pointerEvents: "none", userSelect: "none",
    },
    cardTop: {
        display: "flex", justifyContent: "space-between",
        gap: 16, alignItems: "flex-start", marginBottom: 20,
    },
    cardInfo: { flex: 1 },
    cinemaTag: {
        display: "inline-block",
        padding: "5px 10px", borderRadius: 4,
        background: "rgba(255,220,80,0.08)",
        border: "1px solid rgba(255,220,80,0.2)",
        color: "rgba(255,220,80,0.75)",
        fontSize: 10, fontWeight: 700, letterSpacing: "2px",
        marginBottom: 10,
    },
    cinemaName: {
        margin: "0 0 8px", fontSize: "1.2rem",
        fontWeight: 700, lineHeight: 1.2,
        color: "#f0ece0", letterSpacing: "-0.3px",
    },
    cinemaAddress: {
        margin: "0 0 14px",
        color: "rgba(255,255,255,0.45)",
        fontSize: "0.88rem", lineHeight: 1.6,
    },
    metaRow: { display: "flex", flexWrap: "wrap", gap: 8 },
    metaChip: {
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "6px 10px", borderRadius: 6,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "rgba(255,255,255,0.6)",
        fontSize: "0.82rem", fontWeight: 500,
    },
    metaChipIcon: { fontSize: 12 },
    logo: {
        width: 68, height: 68, objectFit: "cover",
        display: "block",
    },
    logoPlaceholder: {
        width: 68, height: 68, borderRadius: 12,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        fontSize: "1.6rem",
    },
    cardDivider: {
        height: 1,
        background: "rgba(255,255,255,0.07)",
        marginBottom: 16,
    },
    cardBottom: {
        display: "flex", justifyContent: "space-between",
        alignItems: "center",
    },
    cardBottomLeft: { display: "flex", alignItems: "center", gap: 8 },
    idLabel: {
        fontSize: 10, fontWeight: 700, letterSpacing: "2px",
        color: "rgba(255,255,255,0.25)", textTransform: "uppercase",
    },
    idValue: {
        fontSize: 12, fontWeight: 600,
        color: "rgba(255,255,255,0.45)",
        padding: "3px 8px", borderRadius: 4,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.07)",
    },
    viewBtn: {
        padding: "10px 18px",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 8,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 700, fontSize: "0.88rem",
        letterSpacing: "0.3px",
        color: "#fff",
        background: "rgba(255,255,255,0.06)",
    },

    /* Empty */
    emptyState: {
        textAlign: "center", padding: "80px 24px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
    },
    emptyIcon: { fontSize: "3.5rem", marginBottom: 16, filter: "grayscale(0.4)" },
    emptyTitle: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "2rem", letterSpacing: "2px",
        margin: "0 0 10px", color: "rgba(255,255,255,0.55)",
    },
    emptyText: {
        margin: "0 auto", color: "rgba(255,255,255,0.35)",
        fontSize: 14, lineHeight: 1.8, maxWidth: 380,
    },

    /* Skeleton */
    skeletonCard: {
        padding: 24, borderRadius: 16,
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.05)",
    },
    skeletonLine: { borderRadius: 6, display: "block" },

    /* Footer */
    footer: { marginTop: 60 },
    footerInner: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    footerBrand: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "1.2rem", letterSpacing: "4px",
        color: "rgba(255,220,80,0.4)",
    },
    footerNote: {
        fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.5px",
    },
};

export default CinemaSearchPage;