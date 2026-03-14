import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL =
    process.env.REACT_APP_BACKEND_SERVER_URI || "http://localhost:8081";

const CinemaSearchPage = () => {
    const navigate = useNavigate();

    const [zipCode, setZipCode] = useState("");
    const [cinemas, setCinemas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageLoaded, setPageLoaded] = useState(false);
    const [error, setError] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const searchCinemas = async (zip) => {
        if (!zip || !zip.trim()) {
            setError("Please enter a ZIP Code.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${BACKEND_URL}/movieglu/nearby?zip=${encodeURIComponent(zip)}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch nearby cinemas.");
            }

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
        setPageLoaded(true);

        const savedToken = localStorage.getItem("accessToken");
        const savedZipCode = localStorage.getItem("zipCode");

        if (savedToken && savedZipCode) {
            setIsLoggedIn(true);
            setZipCode(savedZipCode);
            searchCinemas(savedZipCode);
        }
    }, []);

    const handleSearch = async () => {
        searchCinemas(zipCode);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleViewMovies = (cinemaId) => {
        navigate(`/cinema/${cinemaId}`);
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
                    <div style={styles.heroBadge}>Movie Discovery</div>
                    <h1 style={styles.heroTitle}>Find Nearby Cinemas</h1>
                    <p style={styles.heroSubtitle}>
                        Search stylishly. Explore nearby cinemas and jump into movie
                        showtimes with one click.
                    </p>

                    <div style={styles.searchCard}>
                        {isLoggedIn && zipCode ? (
                            <div style={styles.loggedInMessage}>
                                Using your saved ZIP Code: <strong>{zipCode}</strong>
                            </div>
                        ) : null}

                        <div style={styles.searchRow}>
                            <input
                                type="text"
                                placeholder="Enter ZIP Code"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                                onKeyDown={handleKeyDown}
                                style={styles.input}
                            />

                            <button
                                onClick={handleSearch}
                                style={styles.searchButton}
                                disabled={loading}
                            >
                                {loading ? "Searching..." : "Search"}
                            </button>
                        </div>

                        {error && <div style={styles.errorBox}>{error}</div>}
                    </div>
                </section>

                <section style={styles.resultsSection}>
                    <div style={styles.resultsHeader}>
                        <h2 style={styles.resultsTitle}>Nearby Cinemas</h2>
                        <p style={styles.resultsCount}>
                            {cinemas.length > 0
                                ? `${cinemas.length} cinema${cinemas.length > 1 ? "s" : ""} found`
                                : "Search to discover nearby cinemas"}
                        </p>
                    </div>

                    {loading ? (
                        <div style={styles.loadingGrid}>
                            {[1, 2, 3].map((item) => (
                                <div key={item} style={styles.skeletonCard}>
                                    <div style={styles.skeletonLineLarge}></div>
                                    <div style={styles.skeletonLine}></div>
                                    <div style={styles.skeletonLineShort}></div>
                                </div>
                            ))}
                        </div>
                    ) : cinemas.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>🎬</div>
                            <h3 style={styles.emptyTitle}>No cinemas to show yet</h3>
                            <p style={styles.emptyText}>
                                {isLoggedIn
                                    ? "We could not find cinemas for your saved ZIP Code."
                                    : "Enter a ZIP Code above and search for nearby cinemas."}
                            </p>
                        </div>
                    ) : (
                        <div style={styles.cardGrid}>
                            {cinemas.map((cinema) => (
                                <div key={cinema.id} style={styles.cinemaCard}>
                                    <div style={styles.cardTop}>
                                        <div style={styles.cardInfo}>
                                            <div style={styles.cardTag}>Cinema</div>
                                            <h3 style={styles.cinemaName}>{cinema.name}</h3>
                                            <p style={styles.cinemaAddress}>
                                                {cinema.address || "Address not available"}
                                            </p>
                                            <div style={styles.metaRow}>
                                                <span style={styles.metaPill}>
                                                    📍 {cinema.city || "Unknown city"}
                                                </span>
                                                <span style={styles.metaPill}>
                                                    📏{" "}
                                                    {cinema.distance !== undefined &&
                                                        cinema.distance !== null
                                                        ? `${Number(cinema.distance).toFixed(1)} km`
                                                        : "Distance unavailable"}
                                                </span>
                                            </div>
                                        </div>

                                        {cinema.logo ? (
                                            <img
                                                src={cinema.logo}
                                                alt={cinema.name}
                                                style={styles.logo}
                                            />
                                        ) : (
                                            <div style={styles.logoPlaceholder}>🎥</div>
                                        )}
                                    </div>

                                    <div style={styles.cardBottom}>
                                        <button
                                            style={styles.viewButton}
                                            onClick={() => handleViewMovies(cinema.id)}
                                        >
                                            View Movies
                                        </button>
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
        marginBottom: "36px",
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
        fontSize: "clamp(2.2rem, 5vw, 4rem)",
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
    searchCard: {
        marginTop: "28px",
        padding: "20px",
        borderRadius: "24px",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
    },
    loggedInMessage: {
        marginBottom: "14px",
        padding: "12px 14px",
        borderRadius: "14px",
        background: "rgba(99,102,241,0.14)",
        border: "1px solid rgba(99,102,241,0.22)",
        color: "#ddd6fe",
        fontSize: "0.95rem",
    },
    searchRow: {
        display: "flex",
        gap: "14px",
        flexWrap: "wrap",
    },
    input: {
        flex: "1 1 280px",
        minHeight: "56px",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.12)",
        outline: "none",
        padding: "0 18px",
        background: "rgba(255,255,255,0.10)",
        color: "#ffffff",
        fontSize: "1rem",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
    },
    searchButton: {
        minWidth: "140px",
        minHeight: "56px",
        border: "none",
        borderRadius: "16px",
        cursor: "pointer",
        fontSize: "1rem",
        fontWeight: 700,
        color: "#fff",
        background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
        boxShadow: "0 14px 32px rgba(236,72,153,0.28)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
    },
    errorBox: {
        marginTop: "14px",
        padding: "12px 14px",
        borderRadius: "14px",
        background: "rgba(239,68,68,0.12)",
        border: "1px solid rgba(239,68,68,0.25)",
        color: "#fecaca",
        fontSize: "0.95rem",
    },
    resultsSection: {
        marginTop: "34px",
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
    cardGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "20px",
    },
    cinemaCard: {
        padding: "22px",
        borderRadius: "24px",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 18px 48px rgba(0,0,0,0.24)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
    },
    cardTop: {
        display: "flex",
        justifyContent: "space-between",
        gap: "18px",
        alignItems: "flex-start",
    },
    cardInfo: {
        flex: 1,
    },
    cardTag: {
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: "999px",
        background: "rgba(139,92,246,0.16)",
        color: "#c4b5fd",
        fontSize: "12px",
        fontWeight: 700,
        marginBottom: "12px",
    },
    cinemaName: {
        margin: "0 0 8px",
        fontSize: "1.35rem",
        lineHeight: 1.2,
        fontWeight: 800,
        letterSpacing: "-0.6px",
    },
    cinemaAddress: {
        margin: "0 0 14px",
        color: "rgba(255,255,255,0.70)",
        fontSize: "0.98rem",
        lineHeight: 1.6,
    },
    metaRow: {
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
    },
    metaPill: {
        padding: "8px 12px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.08)",
        color: "#e2e8f0",
        fontSize: "0.88rem",
    },
    logo: {
        width: "74px",
        height: "74px",
        objectFit: "cover",
        borderRadius: "18px",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.10)",
    },
    logoPlaceholder: {
        width: "74px",
        height: "74px",
        borderRadius: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.10)",
        fontSize: "1.8rem",
    },
    cardBottom: {
        marginTop: "20px",
        display: "flex",
        justifyContent: "flex-end",
    },
    viewButton: {
        minHeight: "46px",
        padding: "0 18px",
        border: "none",
        borderRadius: "14px",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: "0.95rem",
        color: "#fff",
        background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
        boxShadow: "0 10px 26px rgba(99,102,241,0.28)",
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
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "20px",
    },
    skeletonCard: {
        padding: "22px",
        borderRadius: "24px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
    },
    skeletonLineLarge: {
        width: "60%",
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

export default CinemaSearchPage;