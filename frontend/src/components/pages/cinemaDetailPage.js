import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const BACKEND_URL =
    process.env.REACT_APP_BACKEND_SERVER_URI || "http://localhost:8081";

/* ─── Keyframe injection ─────────────────────────────────────────── */
const injectStyles = () => {
    if (document.getElementById("cinema-detail-styles")) return;
    const style = document.createElement("style");
    style.id = "cinema-detail-styles";
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,300&display=swap');
 
        @keyframes grain {
            0%, 100% { transform: translate(0,0); }
            10%       { transform: translate(-2%,-3%); }
            30%       { transform: translate(3%,2%); }
            50%       { transform: translate(-1%,4%); }
            70%       { transform: translate(4%,-1%); }
            90%       { transform: translate(-3%,1%); }
        }
        @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(28px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
            0%   { background-position: -700px 0; }
            100% { background-position: 700px 0; }
        }
        @keyframes pulseGlow {
            0%,100% { box-shadow: 0 0 0 0 rgba(255,200,50,0); }
            50%      { box-shadow: 0 0 24px 4px rgba(255,200,50,0.18); }
        }
        @keyframes tickerScroll {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
        }
        @keyframes scanline {
            0%   { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
        }
 
        .cinema-page * { box-sizing: border-box; }
 
        .cinema-page {
            font-family: 'DM Sans', sans-serif;
        }
 
        /* Grain overlay */
        .cinema-page::after {
            content: '';
            position: fixed;
            inset: -50%;
            width: 200%;
            height: 200%;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
            opacity: 0.035;
            pointer-events: none;
            animation: grain 8s steps(10) infinite;
            z-index: 9999;
        }
 
        /* Scanline flicker */
        .scanline-bar {
            position: fixed;
            left: 0; right: 0;
            height: 2px;
            background: linear-gradient(transparent, rgba(255,220,80,0.06), transparent);
            pointer-events: none;
            animation: scanline 8s linear infinite;
            z-index: 9998;
        }
 
        /* Back button hover */
        .back-btn:hover {
            background: rgba(255,220,80,0.12) !important;
            border-color: rgba(255,220,80,0.5) !important;
            color: #ffd84f !important;
            transform: translateX(-3px);
        }
 
        /* Movie card hover */
        .movie-card {
            transition: transform 0.35s cubic-bezier(.22,.68,0,1.2), box-shadow 0.35s ease, border-color 0.3s ease;
            animation: fadeSlideUp 0.55s ease both;
        }
        .movie-card:hover {
            transform: translateY(-6px) scale(1.012);
            box-shadow: 0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,220,80,0.2) !important;
            border-color: rgba(255,220,80,0.25) !important;
        }
        .movie-card:hover .poster-img {
            transform: scale(1.04);
        }
 
        /* Showtime pill hover */
        .showtime-pill:hover {
            background: #ffd84f !important;
            color: #0d0d14 !important;
            transform: translateY(-2px) scale(1.06);
            box-shadow: 0 8px 20px rgba(255,216,79,0.4) !important;
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
            display: flex;
            gap: 0;
            animation: tickerScroll 28s linear infinite;
            width: max-content;
        }
        .ticker-inner:hover { animation-play-state: paused; }
 
        /* Stagger cards */
        .movie-card:nth-child(1)  { animation-delay: 0.05s; }
        .movie-card:nth-child(2)  { animation-delay: 0.12s; }
        .movie-card:nth-child(3)  { animation-delay: 0.19s; }
        .movie-card:nth-child(4)  { animation-delay: 0.26s; }
        .movie-card:nth-child(5)  { animation-delay: 0.33s; }
        .movie-card:nth-child(6)  { animation-delay: 0.40s; }
 
        .poster-wrap { overflow: hidden; border-radius: 14px; }
        .poster-img  { transition: transform 0.5s ease; display: block; }
 
        /* Section fade-in */
        .section-reveal {
            animation: fadeSlideUp 0.6s ease both;
        }
 
        /* Divider line */
        .gold-divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255,220,80,0.4), transparent);
            margin: 0;
            border: none;
        }
    `;
    document.head.appendChild(style);
};

/* ─── Ticker ───────────────────────────────────────────────────── */
const Ticker = () => {
    const items = ["NOW SHOWING", "BOOK YOUR SEATS", "LIMITED AVAILABILITY", "PREMIUM EXPERIENCE", "NOW SHOWING", "BOOK YOUR SEATS", "LIMITED AVAILABILITY", "PREMIUM EXPERIENCE"];
    return (
        <div style={{ overflow: "hidden", borderTop: "1px solid rgba(255,220,80,0.15)", borderBottom: "1px solid rgba(255,220,80,0.15)", padding: "10px 0", marginBottom: "36px" }}>
            <div className="ticker-inner">
                {[...items, ...items].map((t, i) => (
                    <span key={i} style={{ whiteSpace: "nowrap", padding: "0 28px", fontSize: "11px", fontWeight: 700, letterSpacing: "3px", color: i % 2 === 0 ? "rgba(255,220,80,0.7)" : "rgba(255,255,255,0.25)" }}>
                        {t} {i % 2 === 0 ? "✦" : "·"}
                    </span>
                ))}
            </div>
        </div>
    );
};

/* ─── Main Component ────────────────────────────────────────────── */
const CinemaDetailPage = () => {
    const navigate = useNavigate();
    const { cinemaId } = useParams();
    const location = useLocation();
    const cinemaName = location.state?.cinemaName || "Cinema";

    const [films, setFilms] = useState([]);
    const [date, setDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [pageLoaded, setPageLoaded] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        injectStyles();
        setTimeout(() => setPageLoaded(true), 60);
        fetchCinemaDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cinemaId]);

    const fetchCinemaDetails = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await fetch(`${BACKEND_URL}/movieglu/cinema/${cinemaId}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to fetch cinema movies.");
            setFilms(Array.isArray(data.films) ? data.films : []);
            setDate(data.date || "");
        } catch (err) {
            console.error("Cinema detail error:", err);
            setError(err.message || "Something went wrong while fetching movies.");
            setFilms([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => navigate("/cinemas");

    return (
        <div className="cinema-page" style={s.page}>
            <div className="scanline-bar" />

            {/* Ambient background orbs */}
            <div style={s.orbTopLeft} />
            <div style={s.orbBottomRight} />
            <div style={s.orbCenter} />

            {/* Vertical film-strip gutters */}
            <div style={{ ...s.filmStrip, left: 0 }}>
                {Array.from({ length: 24 }).map((_, i) => <div key={i} style={s.filmHole} />)}
            </div>
            <div style={{ ...s.filmStrip, right: 0 }}>
                {Array.from({ length: 24 }).map((_, i) => <div key={i} style={s.filmHole} />)}
            </div>

            <div style={{ ...s.container, opacity: pageLoaded ? 1 : 0, transform: pageLoaded ? "none" : "translateY(24px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>

                {/* ── Header ── */}
                <header style={s.header} className="section-reveal">
                    <button className="back-btn" style={s.backBtn} onClick={handleBack}>
                        <span style={{ marginRight: 6, fontSize: 13 }}>←</span> Back to Cinemas
                    </button>

                    <div style={s.headerRight}>
                        <div style={s.nowShowingBadge}>
                            <span style={s.dot} />
                            LIVE LISTINGS
                        </div>
                    </div>
                </header>

                {/* ── Hero ── */}
                <section style={s.hero} className="section-reveal">
                    <p style={s.heroEyebrow}>Cinema Experience</p>
                    <h1 style={s.heroTitle}>{cinemaName}</h1>

                    <div style={s.heroMeta}>
                        <div style={s.metaChip}>
                            <span style={s.metaIcon}>🎟</span>
                            <span style={s.metaLabel}>ID</span>
                            <span style={s.metaValue}>{cinemaId}</span>
                        </div>
                        <div style={s.metaDividerDot}>✦</div>
                        <div style={s.metaChip}>
                            <span style={s.metaIcon}>📅</span>
                            <span style={s.metaLabel}>Date</span>
                            <span style={s.metaValue}>{date || "Today"}</span>
                        </div>
                        <div style={s.metaDividerDot}>✦</div>
                        <div style={s.metaChip}>
                            <span style={s.metaIcon}>🎬</span>
                            <span style={s.metaLabel}>Films</span>
                            <span style={s.metaValue}>{loading ? "—" : films.length}</span>
                        </div>
                    </div>

                    {error && (
                        <div style={s.errorBox}>
                            <span style={{ marginRight: 8 }}>⚠</span>
                            {error}
                        </div>
                    )}
                </section>

                <hr className="gold-divider" />
                <Ticker />

                {/* ── Results ── */}
                <section>
                    <div style={s.sectionHead}>
                        <div>
                            <h2 style={s.sectionTitle}>Now Showing</h2>
                            <p style={s.sectionSub}>
                                {!loading && films.length > 0
                                    ? `${films.length} feature${films.length > 1 ? "s" : ""} screening today`
                                    : "Showtimes for today"}
                            </p>
                        </div>
                        {!loading && films.length > 0 && (
                            <div style={s.countBadge}>{films.length}</div>
                        )}
                    </div>

                    {loading ? (
                        <div style={s.grid}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={s.skeletonCard}>
                                    <div style={{ ...s.skeletonPoster, ...{ className: "skeleton-shimmer" } }} className="skeleton-shimmer" />
                                    <div style={s.skeletonBody}>
                                        <div style={{ ...s.skeletonLine, width: "70%", height: 22, marginBottom: 14 }} className="skeleton-shimmer" />
                                        <div style={{ ...s.skeletonLine, width: "90%", height: 13, marginBottom: 10 }} className="skeleton-shimmer" />
                                        <div style={{ ...s.skeletonLine, width: "50%", height: 13, marginBottom: 20 }} className="skeleton-shimmer" />
                                        <div style={{ display: "flex", gap: 8 }}>
                                            {[1, 2, 3].map(j => <div key={j} style={{ ...s.skeletonLine, width: 64, height: 34, borderRadius: 20 }} className="skeleton-shimmer" />)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : films.length === 0 ? (
                        <div style={s.emptyState}>
                            <div style={s.emptyIconWrap}>🍿</div>
                            <h3 style={s.emptyTitle}>No Screenings Today</h3>
                            <p style={s.emptyText}>This cinema doesn't have any showtimes available right now. Check back soon.</p>
                        </div>
                    ) : (
                        <div style={s.grid}>
                            {films.map((film, idx) => (
                                <div key={film.id} className="movie-card" style={s.movieCard}>
                                    {/* Number label */}
                                    <div style={s.cardNumber}>
                                        {String(idx + 1).padStart(2, "0")}
                                    </div>

                                    <div style={s.cardTop}>
                                        <div className="poster-wrap">
                                            {film.poster ? (
                                                <img
                                                    className="poster-img"
                                                    src={film.poster}
                                                    alt={film.name}
                                                    style={s.poster}
                                                />
                                            ) : (
                                                <div style={s.posterPlaceholder}>
                                                    <span style={{ fontSize: 32 }}>🎬</span>
                                                </div>
                                            )}
                                        </div>

                                        <div style={s.cardInfo}>
                                            <div style={s.nowShowingTag}>NOW SHOWING</div>
                                            <h3 style={s.filmTitle}>{film.name}</h3>
                                            <div style={s.ratingRow}>
                                                <span style={s.ratingLabel}>Rating</span>
                                                <span style={s.ratingValue}>{film.ageRating || "N/A"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={s.showtimesSection}>
                                        <div style={s.showtimesHeader}>
                                            <span style={s.showtimesLabel}>Showtimes</span>
                                            {film.showtimes?.length > 0 && (
                                                <span style={s.showtimesCount}>{film.showtimes.length} session{film.showtimes.length > 1 ? "s" : ""}</span>
                                            )}
                                        </div>

                                        {film.showtimes && film.showtimes.length > 0 ? (
                                            <div style={s.showtimesWrap}>
                                                {film.showtimes.map((time, i) => (
                                                    <span key={i} className="showtime-pill" style={s.showtimePill}>
                                                        {time}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={s.noShowtimes}>No showtimes listed</p>
                                        )}
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
                        <span style={s.footerNote}>Showtimes subject to change without notice</span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

/* ─── Styles ────────────────────────────────────────────────────── */
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
        position: "fixed",
        top: -160,
        left: -80,
        width: 420,
        height: 420,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,200,50,0.09) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
    },
    orbBottomRight: {
        position: "fixed",
        bottom: -180,
        right: -60,
        width: 480,
        height: 480,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(180,80,255,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
    },
    orbCenter: {
        position: "fixed",
        top: "40%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        width: 600,
        height: 300,
        background: "radial-gradient(ellipse, rgba(255,200,50,0.03) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
    },
    filmStrip: {
        position: "fixed",
        top: 0,
        bottom: 0,
        width: 28,
        background: "rgba(0,0,0,0.5)",
        borderRight: "1px solid rgba(255,255,255,0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "12px 0",
        zIndex: 1,
        pointerEvents: "none",
    },
    filmHole: {
        width: 10,
        height: 8,
        borderRadius: 2,
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.04)",
    },
    container: {
        maxWidth: 1080,
        margin: "0 auto",
        position: "relative",
        zIndex: 2,
    },

    /* Header */
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 40,
    },
    backBtn: {
        display: "inline-flex",
        alignItems: "center",
        padding: "10px 20px",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)",
        color: "rgba(255,255,255,0.75)",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.5px",
        fontFamily: "'DM Sans', sans-serif",
        transition: "all 0.25s ease",
    },
    headerRight: {
        display: "flex",
        alignItems: "center",
        gap: 12,
    },
    nowShowingBadge: {
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 14px",
        borderRadius: 6,
        border: "1px solid rgba(255,220,80,0.25)",
        background: "rgba(255,220,80,0.06)",
        color: "rgba(255,220,80,0.85)",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "2px",
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "#ffd84f",
        boxShadow: "0 0 8px #ffd84f",
    },

    /* Hero */
    hero: {
        marginBottom: 40,
    },
    heroEyebrow: {
        margin: "0 0 10px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "4px",
        color: "rgba(255,220,80,0.6)",
        textTransform: "uppercase",
    },
    heroTitle: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "clamp(3.5rem, 7vw, 6rem)",
        lineHeight: 0.95,
        margin: "0 0 28px",
        letterSpacing: "2px",
        background: "linear-gradient(135deg, #ffffff 30%, rgba(255,220,80,0.8) 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    },
    heroMeta: {
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
    },
    metaChip: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 18px",
        borderRadius: 8,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
    },
    metaIcon: { fontSize: 15 },
    metaLabel: {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "2px",
        color: "rgba(255,255,255,0.35)",
        textTransform: "uppercase",
    },
    metaValue: {
        fontSize: 14,
        fontWeight: 600,
        color: "#fff",
        marginLeft: 2,
    },
    metaDividerDot: {
        color: "rgba(255,220,80,0.3)",
        fontSize: 10,
    },
    errorBox: {
        marginTop: 20,
        padding: "14px 18px",
        borderRadius: 8,
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.2)",
        color: "#fca5a5",
        fontSize: 14,
        display: "flex",
        alignItems: "center",
    },

    /* Section head */
    sectionHead: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 24,
    },
    sectionTitle: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "2.2rem",
        letterSpacing: "2px",
        margin: 0,
        color: "#fff",
    },
    sectionSub: {
        margin: "4px 0 0",
        fontSize: 13,
        color: "rgba(255,255,255,0.4)",
        letterSpacing: "0.5px",
    },
    countBadge: {
        width: 40,
        height: 40,
        borderRadius: 8,
        background: "rgba(255,220,80,0.1)",
        border: "1px solid rgba(255,220,80,0.25)",
        color: "#ffd84f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        fontWeight: 800,
    },

    /* Grid */
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 20,
    },

    /* Movie card */
    movieCard: {
        position: "relative",
        padding: "24px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
        overflow: "hidden",
    },
    cardNumber: {
        position: "absolute",
        top: 16,
        right: 18,
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "3rem",
        lineHeight: 1,
        color: "rgba(255,255,255,0.05)",
        letterSpacing: "1px",
        pointerEvents: "none",
        userSelect: "none",
    },
    cardTop: {
        display: "flex",
        gap: 18,
        alignItems: "flex-start",
        marginBottom: 20,
    },
    poster: {
        width: 100,
        height: 148,
        objectFit: "cover",
        display: "block",
    },
    posterPlaceholder: {
        width: 100,
        height: 148,
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
    },
    cardInfo: { flex: 1, paddingTop: 4 },
    nowShowingTag: {
        display: "inline-block",
        padding: "5px 10px",
        borderRadius: 4,
        background: "rgba(255,220,80,0.08)",
        border: "1px solid rgba(255,220,80,0.2)",
        color: "rgba(255,220,80,0.75)",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "2px",
        marginBottom: 10,
    },
    filmTitle: {
        margin: "0 0 12px",
        fontSize: "1.25rem",
        fontWeight: 700,
        lineHeight: 1.2,
        color: "#f0ece0",
        letterSpacing: "-0.3px",
    },
    ratingRow: {
        display: "flex",
        alignItems: "center",
        gap: 8,
    },
    ratingLabel: {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "2px",
        color: "rgba(255,255,255,0.3)",
        textTransform: "uppercase",
    },
    ratingValue: {
        padding: "3px 8px",
        borderRadius: 4,
        border: "1px solid rgba(255,255,255,0.15)",
        background: "rgba(255,255,255,0.06)",
        fontSize: 12,
        fontWeight: 700,
        color: "#fff",
    },

    /* Showtimes */
    showtimesSection: {
        borderTop: "1px solid rgba(255,255,255,0.07)",
        paddingTop: 16,
    },
    showtimesHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    showtimesLabel: {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "2.5px",
        color: "rgba(255,255,255,0.4)",
        textTransform: "uppercase",
    },
    showtimesCount: {
        fontSize: 11,
        color: "rgba(255,220,80,0.55)",
        fontWeight: 600,
    },
    showtimesWrap: {
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
    },
    showtimePill: {
        padding: "8px 14px",
        borderRadius: 6,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#fff",
        fontWeight: 700,
        fontSize: "0.88rem",
        letterSpacing: "0.5px",
        cursor: "default",
        transition: "all 0.22s cubic-bezier(.22,.68,0,1.2)",
        userSelect: "none",
    },
    noShowtimes: {
        margin: 0,
        fontSize: 13,
        color: "rgba(255,255,255,0.3)",
        fontStyle: "italic",
    },

    /* Empty state */
    emptyState: {
        textAlign: "center",
        padding: "80px 24px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
    },
    emptyIconWrap: {
        fontSize: "3.5rem",
        marginBottom: 16,
        filter: "grayscale(0.4)",
    },
    emptyTitle: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "2rem",
        letterSpacing: "2px",
        margin: "0 0 10px",
        color: "rgba(255,255,255,0.6)",
    },
    emptyText: {
        margin: 0,
        color: "rgba(255,255,255,0.35)",
        fontSize: 14,
        lineHeight: 1.8,
        maxWidth: 380,
        marginLeft: "auto",
        marginRight: "auto",
    },

    /* Skeleton */
    skeletonCard: {
        display: "flex",
        gap: 18,
        padding: 24,
        borderRadius: 16,
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.05)",
    },
    skeletonPoster: {
        width: 100,
        height: 148,
        borderRadius: 14,
        flexShrink: 0,
    },
    skeletonBody: { flex: 1, paddingTop: 6 },
    skeletonLine: {
        borderRadius: 6,
        display: "block",
    },

    /* Footer */
    footer: {
        marginTop: 60,
    },
    footerInner: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    footerBrand: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "1.2rem",
        letterSpacing: "4px",
        color: "rgba(255,220,80,0.4)",
    },
    footerNote: {
        fontSize: 11,
        color: "rgba(255,255,255,0.2)",
        letterSpacing: "0.5px",
    },
};

export default CinemaDetailPage;
