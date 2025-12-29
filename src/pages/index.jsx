import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Outlet } from 'react-router-dom';
import Layout from "./Layout.jsx";

// V1 Components
import Dashboard from "./Dashboard";
import Clients from "./Clients";
import Sessions from "./Sessions";
import Tasks from "./Tasks";
import KnowledgeBase from "./KnowledgeBase";
import Journeys from "./Journeys";
import Practitioners from "./Practitioners";
import Notebook from "./Notebook";
import Approvals from "./Approvals";
import ClientSessions from "./ClientSessions";
import ClientJourneys from "./ClientJourneys";
import ClientTasks from "./ClientTasks";
import Files from "./Files";
import APIUsage from "./APIUsage";
import Chats from "./Chats";
import Payments from "./Payments";

// V2 Components
import V2Dashboard from "./V2Dashboard";
import V2Clients from "./V2Clients";
import V2Sessions from "./V2Sessions";
import V2Journeys from "./V2Journeys";
import V2Tasks from "./V2Tasks";
import V2KnowledgeBase from "./V2KnowledgeBase";
import V2Payments from "./V2Payments";
import V2Practitioners from "./V2Practitioners";
import V2Notebook from "./V2Notebook";

// V3 Components
import V3Dashboard from "./V3Dashboard";
import V3Contacts from "./V3Contacts";
import V3ContactPage from "./V3ContactPage";
import V3Sessions from "./V3Sessions";
import V3SessionPage from "./V3SessionPage";
import V3Journeys from "./V3Journeys";
import V3JourneyPage from "./V3JourneyPage";
import V3Tasks from "./V3Tasks";
import V3Notebook from "./V3Notebook";
import V3KnowledgeBase from "./V3KnowledgeBase";
import V3Payments from "./V3Payments";
// import V3Practitioners from "./V3Practitioners"; // Deprecated/Merged into Contacts
const V3Practitioners = V3Contacts; // Alias for safety if needed

// V4 & V5 Components
import V4Dashboard from "./V4Dashboard";
import V5Dashboard from "./V5Dashboard";

import VersionSwitcher from "@/components/VersionSwitcher";

const PAGES = {
    Dashboard: Dashboard,
    Clients: Clients,
    Sessions: Sessions,
    Tasks: Tasks,
    KnowledgeBase: KnowledgeBase,
    Journeys: Journeys,
    Practitioners: Practitioners,
    Notebook: Notebook,
    Approvals: Approvals,
    ClientSessions: ClientSessions,
    ClientJourneys: ClientJourneys,
    ClientTasks: ClientTasks,
    Files: Files,
    APIUsage: APIUsage,
    Chats: Chats,
    Payments: Payments,
};

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }
    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || 'Dashboard';
}

function V1LayoutWrapper() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    return (
        <Layout currentPageName={currentPage}>
            <Outlet />
        </Layout>
    );
}

function PagesContent() {
    return (
        <>
            <Routes>
                {/* ================= V1 ROUTES (LEGACY) ================= */}
                <Route element={<V1LayoutWrapper />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/Dashboard" element={<Dashboard />} />
                    <Route path="/Clients" element={<Clients />} />
                    <Route path="/Sessions" element={<Sessions />} />
                    <Route path="/Tasks" element={<Tasks />} />
                    <Route path="/KnowledgeBase" element={<KnowledgeBase />} />
                    <Route path="/Journeys" element={<Journeys />} />
                    <Route path="/Practitioners" element={<Practitioners />} />
                    <Route path="/Notebook" element={<Notebook />} />
                    <Route path="/Approvals" element={<Approvals />} />
                    <Route path="/ClientSessions" element={<ClientSessions />} />
                    <Route path="/ClientJourneys" element={<ClientJourneys />} />
                    <Route path="/ClientTasks" element={<ClientTasks />} />
                    <Route path="/Files" element={<Files />} />
                    <Route path="/APIUsage" element={<APIUsage />} />
                    <Route path="/Chats" element={<Chats />} />
                    <Route path="/Payments" element={<Payments />} />
                </Route>

                {/* ================= V2 ROUTES (COMMAND CENTER) ================= */}
                <Route path="/v2" element={<V2Dashboard />} />
                <Route path="/v2/clients" element={<V2Clients />} />
                <Route path="/v2/sessions" element={<V2Sessions />} />
                <Route path="/v2/journeys" element={<V2Journeys />} />
                <Route path="/v2/tasks" element={<V2Tasks />} />
                <Route path="/v2/notebook" element={<V2Notebook />} />
                <Route path="/v2/knowledge-base" element={<V2KnowledgeBase />} />
                <Route path="/v2/payments" element={<V2Payments />} />
                <Route path="/v2/practitioners" element={<V2Practitioners />} />

                {/* ================= V3 ROUTES (ZEN HYBRID) ================= */}
                <Route path="/v3" element={<V3Dashboard />} />

                {/* Sliders (List Views) */}
                <Route path="/v3/clients" element={<V3Contacts />} /> {/* Redirect/Alias for legacy */}
                <Route path="/v3/contacts" element={<V3Contacts />} />
                <Route path="/v3/sessions" element={<V3Sessions />} />
                <Route path="/v3/journeys" element={<V3Journeys />} />

                {/* Detail Views */}
                <Route path="/v3/contacts/:id" element={<V3ContactPage />} />
                <Route path="/v3/sessions/:id" element={<V3SessionPage />} />
                <Route path="/v3/journeys/:id" element={<V3JourneyPage />} />

                {/* Secondary Pages */}
                <Route path="/v3/tasks" element={<V3Tasks />} />
                <Route path="/v3/notebook" element={<V3Notebook />} />
                <Route path="/v3/knowledge-base" element={<V3KnowledgeBase />} />
                <Route path="/v3/payments" element={<V3Payments />} />
                <Route path="/v3/practitioners" element={<V3Practitioners />} />

                {/* ================= V4 ROUTES (LIVING FEED) ================= */}
                {/* V4 is a single-page feed app, routing handled via filters or internal state if complex */}
                <Route path="/v4" element={<V4Dashboard />} />
                <Route path="/v4/*" element={<V4Dashboard />} />

                {/* ================= V5 ROUTES (SPATIAL CANVAS) ================= */}
                <Route path="/v5" element={<V5Dashboard />} />

            </Routes>

            <VersionSwitcher />
        </>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}