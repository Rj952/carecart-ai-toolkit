"use client";

import dynamic from "next/dynamic";

const CareCartApp = dynamic(() => import("../carecart"), {
    ssr: false,
    loading: () => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0f172a", color: "#3b82f6", fontFamily: "Inter, sans-serif", fontSize: 18 }}>
            Loading CareCart AI Toolkit...
        </div>
    ),
});

export default function Home() {
    return <CareCartApp />;
}
