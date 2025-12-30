import React, { useState, useEffect } from "react";
import { CLIENTS, SESSIONS } from "@/data/testData";
// import api from '../api/api'; // Mocking for now
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Video, TrendingUp, Calendar } from "lucide-react";
import { format, isAfter, isBefore, addDays, isValid } from "date-fns";

import StatsCard from "../components/dashboard/StatsCard";
import UpcomingSessions from "../components/dashboard/UpcomingSessions";
import RecentClients from "../components/dashboard/RecentClients";
import ActivityChart from "../components/dashboard/ActivityChart";
// import PractitionerDashboard from "../components/dashboard/PractitionerDashboard";
// import ClientDashboard from "../components/dashboard/ClientDashboard";

export default function Dashboard() {
  const [currentView, setCurrentView] = useState('coach');

  useEffect(() => {
    const stored = localStorage.getItem('currentView');
    if (stored) setCurrentView(stored);
  }, []);

  // Use mock data
  const clients = CLIENTS;
  const sessions = SESSIONS;

  /* 
  // Temporarily strictly using Coach view for mock demo
  if (currentView === 'practitioner') {
    return <PractitionerDashboard />;
  }

  if (currentView === 'client') {
    return <ClientDashboard />;
  }
  */

  const activeClients = clients.filter(c => c.status === 'active').length;

  const upcomingSessions = sessions.filter(s => {
    if (s.status !== 'upcoming' || !s.date_time) return false;
    const date = new Date(s.date_time);
    return isValid(date) && isAfter(date, new Date());
  }).length;

  const thisWeekSessions = sessions.filter(s => {
    if (!s.date_time) return false;
    const sessionDate = new Date(s.date_time);
    if (!isValid(sessionDate)) return false;

    const today = new Date();
    const weekFromNow = addDays(today, 7);
    return isAfter(sessionDate, today) && isBefore(sessionDate, weekFromNow);
  }).length;

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your coaching practice</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Clients"
            value={clients.length}
            icon={Users}
            bgColor="from-emerald-500 to-teal-600"
            subtitle={`${activeClients} active`}
          />
          <StatsCard
            title="Upcoming Sessions"
            value={upcomingSessions}
            icon={Video}
            bgColor="from-blue-500 to-cyan-600"
            subtitle="Next 30 days"
          />
          <StatsCard
            title="This Week"
            value={thisWeekSessions}
            icon={Calendar}
            bgColor="from-purple-500 to-pink-600"
            subtitle="Sessions scheduled"
          />
          <StatsCard
            title="Growth"
            value="+12%"
            icon={TrendingUp}
            bgColor="from-orange-500 to-red-600"
            subtitle="vs last month"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <UpcomingSessions sessions={sessions} clients={clients} />
          </div>
          <div>
            <RecentClients clients={clients} />
          </div>
        </div>

        <ActivityChart sessions={sessions} />
      </div>
    </div>
  );
}