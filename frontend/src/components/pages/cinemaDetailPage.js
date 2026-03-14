import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const BACKEND_URL =
    process.env.REACT_APP_BACKEND_SERVER_URI || "http://localhost:8081";

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
        setPageLoaded(true);
        fetchCinemaDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cinemaId]);

    const fetchCinemaDetails = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${BACKEND_URL}/movieglu/cinema/${cinemaId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch cinema movies.");
            }

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

    const handleBack = () => {
        navigate("/cinemas");
    };

    return (
        <div style={styles.page}>
            <div style={styles.backgroundGlowOne}></div>
            <div style={styles.backgroundGlowTwo}></div>

            <div
                style={{
                    ...styles.container,
                    opacity: pageLoaded ? 1 : 0,
                    transform: pageLoaded ? "translateY(0px)" : "translateY(16px)",
                }}
            >
                <section style={styles.heroSection}>
                    <button style={styles.backButton} onClick={handleBack}>
                        ← Back to Cinemas
                    </button>

                    <div style={styles.heroBadge}>Cinema Details</div>
                    <h1 style={styles.heroTitle}>{cinemaName}</h1>
                    <p style={styles.heroSubtitle}>
                        Now showing movies and showtimes for this cinema.
                    </p>

                    <div style={styles.infoCard}>
                        <div style={styles.infoPill}>
                            🎟 Cinema ID: <strong style={styles.strongText}>{cinemaId}</strong>
                        </div>
                        <div style={styles.infoPill}>
                            📅 Date: <strong style={styles.strongText}>{date || "Today"}</strong>
                        </div>
                    </div>

                    {error && <div style={styles.errorBox}>{error}</div>}
                </section>

                <section style={styles.resultsSection}>
                    <div style={styles.resultsHeader}>
                        <h2 style={styles.resultsTitle}>Movie Listings</h2>
                        <p style={styles.resultsCount}>
                            {films.length > 0
                                ? `${films.length} movie${films.length > 1 ? "s" : ""} found`
                                : "Movie data will appear here"}
                        </p>
                    </div>

                    {loading ? (
                        <div style={styles.loadingGrid}>
                            {[1, 2, 3].map((item) => (
                                <div key={item} style={styles.skeletonCard}>
                                    <div style={styles.skeletonPoster}></div>
                                    <div style={styles.skeletonTextBlock}>
                                        <div style={styles.skeletonLineLarge}></div>
                                        <div style={styles.skeletonLine}></div>
                                        <div style={styles.skeletonLineShort}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : films.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>🍿</div>
                            <h3 style={styles.emptyTitle}>No movies available</h3>
                            <p style={styles.emptyText}>
                                This cinema does not have showtimes available right now.
                            </p>
                        </div>
                    ) : (
                        <div style={styles.movieGrid}>
                            {films.map((film) => (
                                <div key={film.id} style={styles.movieCard}>
                                    <div style={styles.movieTop}>
                                        {film.poster ? (
                                            <img
                                                src={film.poster}
                                                alt={film.name}
                                                style={styles.poster}
                                            />
                                        ) : (
                                            <div style={styles.posterPlaceholder}>🎬</div>
                                        )}

                                        <div style={styles.movieInfo}>
                                            <div style={styles.movieTag}>Now Showing</div>
                                            <h3 style={styles.movieTitle}>{film.name}</h3>
                                            <p style={styles.movieMeta}>
                                                Age Rating:{" "}
                                                <span style={styles.metaHighlight}>
                                                    {film.ageRating || "N/A"}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div style={styles.showtimesSection}>
                                        <div style={styles.showtimesLabel}>Showtimes</div>

                                        {film.showtimes && film.showtimes.length > 0 ? (
                                            <div style={styles.showtimeWrap}>
                                                {film.showtimes.map((time, index) => (
                                                    <span key={index} style={styles.showtimePill}>
                                                        {time}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={styles.noShowtimeText}>No showtimes available.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

const styles = {
    page: {
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
            "linear-gradient(135deg, #0b1020 0%, #11182d 35%, #1a1e3a 100%)",
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        color: "#f8fafc",
        padding: "40px 20px 60px",
    },
    backgroundGlowOne: {
        position: "absolute",
        top: "-120px",
        left: "-100px",
        width: "320px",
        height: "320px",
        borderRadius: "50%",
        background: "rgba(236, 72, 153, 0.18)",
        filter: "blur(80px)",
        pointerEvents: "none",
    },
    backgroundGlowTwo: {
        position: "absolute",
        bottom: "-120px",
        right: "-80px",
        width: "320px",
        height: "320px",
        borderRadius: "50%",
        background: "rgba(99, 102, 241, 0.18)",
        filter: "blur(80px)",
        pointerEvents: "none",
    },
    container: {
        maxWidth: "1200px",
        margin: "0 auto",
        position: "relative",
        zIndex: 2,
        transition: "all 0.5s ease",
    },
    heroSection: {
        marginBottom: "34px",
    },
    backButton: {
        marginBottom: "20px",
        minHeight: "44px",
        padding: "0 16px",
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: "14px",
        background: "rgba(255,255,255,0.08)",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: 600,
        backdropFilter: "blur(14px)",
    },
    heroBadge: {
        display: "inline-block",
        padding: "8px 14px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(14px)",
        fontSize: "13px",
        color: "#f9a8d4",
        marginBottom: "18px",
        letterSpacing: "0.4px",
    },
    heroTitle: {
        fontSize: "clamp(2.1rem, 5vw, 3.7rem)",
        lineHeight: 1.05,
        margin: "0 0 12px",
        fontWeight: 800,
        letterSpacing: "-1.5px",
    },
    heroSubtitle: {
        margin: 0,
        maxWidth: "700px",
        fontSize: "1.05rem",
        lineHeight: 1.7,
        color: "rgba(255,255,255,0.72)",
    },
    infoCard: {
        marginTop: "24px",
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
    },
    infoPill: {
        padding: "10px 14px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#e2e8f0",
        fontSize: "0.95rem",
    },
    strongText: {
        color: "#ffffff",
    },
    errorBox: {
        marginTop: "16px",
        padding: "12px 14px",
        borderRadius: "14px",
        background: "rgba(239,68,68,0.12)",
        border: "1px solid rgba(239,68,68,0.25)",
        color: "#fecaca",
        fontSize: "0.95rem",
    },
    resultsSection: {
        marginTop: "28px",
    },
    resultsHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "16px",
        marginBottom: "18px",
        flexWrap: "wrap",
    },
    resultsTitle: {
        margin: 0,
        fontSize: "1.6rem",
        fontWeight: 800,
        letterSpacing: "-0.5px",
    },
    resultsCount: {
        margin: 0,
        color: "rgba(255,255,255,0.65)",
        fontSize: "0.95rem",
    },
    movieGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
        gap: "20px",
    },
    movieCard: {
        padding: "22px",
        borderRadius: "24px",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 18px 48px rgba(0,0,0,0.24)",
    },
    movieTop: {
        display: "flex",
        gap: "18px",
        alignItems: "flex-start",
    },
    poster: {
        width: "110px",
        height: "160px",
        objectFit: "cover",
        borderRadius: "18px",
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.08)",
    },
    posterPlaceholder: {
        width: "110px",
        height: "160px",
        borderRadius: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "2rem",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.10)",
    },
    movieInfo: {
        flex: 1,
    },
    movieTag: {
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: "999px",
        background: "rgba(139,92,246,0.16)",
        color: "#c4b5fd",
        fontSize: "12px",
        fontWeight: 700,
        marginBottom: "12px",
    },
    movieTitle: {
        margin: "0 0 10px",
        fontSize: "1.35rem",
        lineHeight: 1.25,
        fontWeight: 800,
        letterSpacing: "-0.5px",
    },
    movieMeta: {
        margin: 0,
        color: "rgba(255,255,255,0.72)",
        lineHeight: 1.6,
    },
    metaHighlight: {
        color: "#ffffff",
        fontWeight: 700,
    },
    showtimesSection: {
        marginTop: "20px",
    },
    showtimesLabel: {
        fontSize: "0.95rem",
        fontWeight: 700,
        marginBottom: "12px",
        color: "#f8fafc",
    },
    showtimeWrap: {
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
    },
    showtimePill: {
        padding: "8px 12px",
        borderRadius: "999px",
        background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
        color: "#fff",
        fontWeight: 700,
        fontSize: "0.9rem",
        boxShadow: "0 10px 24px rgba(99,102,241,0.25)",
    },
    noShowtimeText: {
        margin: 0,
        color: "rgba(255,255,255,0.65)",
    },
    emptyState: {
        textAlign: "center",
        padding: "60px 20px",
        borderRadius: "24px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
    },
    emptyIcon: {
        fontSize: "3rem",
        marginBottom: "14px",
    },
    emptyTitle: {
        margin: "0 0 10px",
        fontSize: "1.3rem",
        fontWeight: 800,
    },
    emptyText: {
        margin: 0,
        color: "rgba(255,255,255,0.70)",
        lineHeight: 1.7,
    },
    loadingGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
        gap: "20px",
    },
    skeletonCard: {
        display: "flex",
        gap: "18px",
        padding: "22px",
        borderRadius: "24px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
    },
    skeletonPoster: {
        width: "110px",
        height: "160px",
        borderRadius: "18px",
        background: "rgba(255,255,255,0.10)",
    },
    skeletonTextBlock: {
        flex: 1,
    },
    skeletonLineLarge: {
        width: "75%",
        height: "24px",
        borderRadius: "12px",
        background: "rgba(255,255,255,0.10)",
        marginBottom: "14px",
    },
    skeletonLine: {
        width: "85%",
        height: "16px",
        borderRadius: "10px",
        background: "rgba(255,255,255,0.08)",
        marginBottom: "10px",
    },
    skeletonLineShort: {
        width: "45%",
        height: "16px",
        borderRadius: "10px",
        background: "rgba(255,255,255,0.08)",
    },
};

export default CinemaDetailPage;
