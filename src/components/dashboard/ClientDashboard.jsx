import React, { useState, useEffect } from "react";
import api from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Calendar, 
  CheckCircle, 
  MapIcon, 
  Video,
  ArrowRight,
  Clock,
  User,
  Loader2,
  AlertCircle,
  Star,
  Target
} from "lucide-react";
import { format, isAfter } from "date-fns";

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <Card className="bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClientDashboard() {
  const [clientId, setClientId] = useState(null);

  useEffect(() => {
    const storedId = localStorage.getItem('viewingAsClientId');
    if (storedId) {
      setClientId(storedId);
    }
  }, []);

  const { data: client } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => api.entities.Client.filter({ id: clientId }),
    enabled: !!clientId,
    select: (data) => data[0]
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['client-sessions', clientId],
    queryFn: () => api.entities.Session.filter({ client_id: clientId }),
    enabled: !!clientId
  });

  const { data: clientJourneys = [] } = useQuery({
    queryKey: ['client-journeys', clientId],
    queryFn: () => api.entities.ClientJourney.filter({ client_id: clientId }),
    enabled: !!clientId
  });

  const { data: journeys = [] } = useQuery({
    queryKey: ['journeys'],
    queryFn: () => api.entities.Journey.list(),
  });

  const { data: journeySteps = [] } = useQuery({
    queryKey: ['journey-steps'],
    queryFn: () => api.entities.JourneyStep.list(),
  });

  const { data: clientJourneySteps = [] } = useQuery({
    queryKey: ['client-journey-steps', clientId],
    queryFn: () => api.entities.ClientJourneyStep.list(),
    enabled: !!clientId
  });

  const { data: actions = [] } = useQuery({
    queryKey: ['client-actions', clientId],
    queryFn: () => api.entities.Action.filter({ client_id: clientId }),
    enabled: !!clientId
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.entities.User.list(),
  });

  const journeyMap = Object.fromEntries(journeys.map(j => [j.id, j]));
  const userMap = Object.fromEntries(users.map(u => [u.email, u]));

  // Calculate metrics
  const now = new Date();
  
  const upcomingSessions = sessions
    .filter(s => s.date_time && isAfter(new Date(s.date_time), now) && s.status !== 'cancelled')
    .sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
  
  const nextSession = upcomingSessions[0];
  
  const completedSessions = sessions.filter(s => 
    s.status === 'completed' || s.status === 'summary_ready'
  ).length;

  const activeJourneys = clientJourneys.filter(j => j.status === 'Active');

  const pendingTasks = actions.filter(a => 
    a.sentToClient && a.status !== 'Done'
  ).length;

  // Recent sessions (last 5 completed)
  const recentSessions = sessions
    .filter(s => s.status === 'completed' || s.status === 'summary_ready')
    .sort((a, b) => new Date(b.date_time) - new Date(a.date_time))
    .slice(0, 5);

  // Recent tasks (last 3 sent to client)
  const recentTasks = actions
    .filter(a => a.sentToClient)
    .sort((a, b) => new Date(b.sentToClientAt || b.created_date) - new Date(a.sentToClientAt || a.created_date))
    .slice(0, 3);

  // Journey progress calculation
  const getJourneyProgress = (clientJourney) => {
    const journey = journeyMap[clientJourney.journey_id];
    const steps = journeySteps.filter(s => s.journey_id === clientJourney.journey_id);
    const completedSteps = clientJourneySteps.filter(
      cjs => cjs.client_journey_id === clientJourney.id && cjs.status === 'Completed'
    ).length;
    
    return {
      journey,
      totalSteps: steps.length,
      completedSteps,
      percentage: steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0
    };
  };

  if (!clientId) {
    return (
      <div className="p-8">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Client Selected</h2>
            <p className="text-gray-600">Please select a client from the dropdown in the header.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessionsLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {client?.full_name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {client?.full_name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-gray-600">Here's your wellness journey at a glance</p>
            </div>
          </div>
        </div>

        {/* Progress Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Upcoming Sessions"
            value={upcomingSessions.length}
            icon={Calendar}
            color="bg-blue-500"
            subtitle={nextSession ? `Next: ${format(new Date(nextSession.date_time), 'MMM d')}` : "None scheduled"}
          />
          <StatCard
            title="Active Journeys"
            value={activeJourneys.length}
            icon={MapIcon}
            color="bg-purple-500"
            subtitle={activeJourneys.length > 0 ? "In progress" : "Start one today!"}
          />
          <StatCard
            title="Pending Tasks"
            value={pendingTasks}
            icon={Target}
            color="bg-amber-500"
            subtitle={pendingTasks === 0 ? "All caught up! 🎉" : "Keep going!"}
          />
          <StatCard
            title="Sessions Completed"
            value={completedSessions}
            icon={CheckCircle}
            color="bg-emerald-500"
            subtitle="Total sessions"
          />
        </div>

        {/* Next Session Card */}
        {nextSession && (
          <Card className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-emerald-600" />
                Your Next Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{nextSession.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(nextSession.date_time), 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{format(new Date(nextSession.date_time), 'h:mm a')}</span>
                    </div>
                    {nextSession.coach_email && userMap[nextSession.coach_email] && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>with {userMap[nextSession.coach_email].full_name}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Link to={createPageUrl('Sessions')}>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                    View Details <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Sessions */}
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600" />
                Recent Sessions
              </CardTitle>
              <Link to={createPageUrl('Sessions')}>
                <Button variant="ghost" size="sm" className="text-emerald-600">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentSessions.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Video className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p>No completed sessions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSessions.map(session => (
                    <div 
                      key={session.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{session.title}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(session.date_time), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        Completed
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-600" />
                Your Tasks
              </CardTitle>
              <Link to={createPageUrl('Tasks')}>
                <Button variant="ghost" size="sm" className="text-emerald-600">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentTasks.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Target className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p>No tasks assigned yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          task.status === 'Done' ? 'bg-emerald-100' : 'bg-amber-100'
                        }`}>
                          {task.status === 'Done' ? (
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-500">
                            {task.dueDate ? `Due: ${format(new Date(task.dueDate), 'MMM d')}` : 'No due date'}
                          </p>
                        </div>
                      </div>
                      <Badge className={
                        task.status === 'Done' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }>
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Journey Progress */}
        {activeJourneys.length > 0 && (
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-purple-600" />
                Your Journey Progress
              </CardTitle>
              <Link to={createPageUrl('Journeys')}>
                <Button variant="ghost" size="sm" className="text-emerald-600">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {activeJourneys.map(clientJourney => {
                  const progress = getJourneyProgress(clientJourney);
                  return (
                    <div key={clientJourney.id} className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {progress.journey?.title || 'Journey'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {progress.completedSteps} of {progress.totalSteps} steps completed
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-amber-500" />
                          <span className="text-lg font-bold text-purple-700">{progress.percentage}%</span>
                        </div>
                      </div>
                      <Progress value={progress.percentage} className="h-3 bg-purple-100" />
                      {progress.percentage === 100 && (
                        <div className="mt-3 flex items-center gap-2 text-emerald-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Journey Complete! 🎉</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Encouragement Card */}
        <Card className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
          <CardContent className="py-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Keep Up the Great Work! 🌟</h3>
            <p className="text-emerald-100 max-w-md mx-auto">
              Every step you take brings you closer to your wellness goals. 
              Your dedication is inspiring!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}