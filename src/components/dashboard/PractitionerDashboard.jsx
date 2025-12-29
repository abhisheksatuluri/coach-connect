import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Clock, 
  CheckCircle, 
  Users, 
  TrendingUp, 
  ArrowRight,
  AlertCircle,
  Loader2
} from "lucide-react";
import { format, startOfMonth, differenceInHours } from "date-fns";

function MetricCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <Card className="bg-white">
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

export default function PractitionerDashboard() {
  const [practitionerId, setPractitionerId] = useState(null);

  useEffect(() => {
    const storedId = localStorage.getItem('viewingAsPractitionerId');
    if (storedId) {
      setPractitionerId(storedId);
    }
  }, []);

  const { data: practitioner } = useQuery({
    queryKey: ['practitioner', practitionerId],
    queryFn: () => base44.entities.Practitioner.get(practitionerId),
    enabled: !!practitionerId
  });

  const { data: approvalRequests = [], isLoading } = useQuery({
    queryKey: ['approvalRequests', practitionerId],
    queryFn: () => base44.entities.ApprovalRequest.filter({ practitioner_id: practitionerId }),
    enabled: !!practitionerId
  });

  const { data: actions = [] } = useQuery({
    queryKey: ['actions'],
    queryFn: () => base44.entities.Action.list(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const actionMap = Object.fromEntries(actions.map(a => [a.id, a]));
  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  // Calculate metrics
  const pendingCount = approvalRequests.filter(r => r.status === 'Pending').length;
  
  const monthStart = startOfMonth(new Date());
  const approvedThisMonth = approvalRequests.filter(r => 
    r.status === 'Approved' && 
    new Date(r.respondedAt || r.updated_date) >= monthStart
  ).length;

  const uniqueClients = new Set(
    approvalRequests
      .map(r => actionMap[r.action_id]?.client_id)
      .filter(Boolean)
  ).size;

  const totalResponded = approvalRequests.filter(r => r.status !== 'Pending').length;
  const approvedCount = approvalRequests.filter(r => r.status === 'Approved').length;
  const approvalRate = totalResponded > 0 ? Math.round((approvedCount / totalResponded) * 100) : 0;

  // Average response time
  const responseTimes = approvalRequests
    .filter(r => r.status !== 'Pending' && r.respondedAt && r.requestedAt)
    .map(r => differenceInHours(new Date(r.respondedAt), new Date(r.requestedAt)));
  const avgResponseTime = responseTimes.length > 0 
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) 
    : 0;

  // Recent requests
  const recentRequests = [...approvalRequests]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 10);

  if (!practitionerId) {
    return (
      <div className="p-8">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Practitioner Selected</h2>
            <p className="text-gray-600">Please select a practitioner from the dropdown in the header.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {practitioner?.name || 'Practitioner'}
          </h1>
          <p className="text-gray-600 mt-1">
            {practitioner?.specialty && (
              <Badge variant="outline" className="mr-2">{practitioner.specialty}</Badge>
            )}
            Here's your approval activity overview
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Pending Approvals"
            value={pendingCount}
            icon={Clock}
            color="bg-amber-500"
            subtitle={pendingCount > 0 ? "Requires attention" : "All caught up!"}
          />
          <MetricCard
            title="Approved This Month"
            value={approvedThisMonth}
            icon={CheckCircle}
            color="bg-emerald-500"
            subtitle={format(new Date(), 'MMMM yyyy')}
          />
          <MetricCard
            title="Clients Worked With"
            value={uniqueClients}
            icon={Users}
            color="bg-blue-500"
            subtitle="Total unique clients"
          />
          <MetricCard
            title="Approval Rate"
            value={`${approvalRate}%`}
            icon={TrendingUp}
            color="bg-purple-500"
            subtitle={`${approvedCount} of ${totalResponded} approved`}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-emerald-700 font-medium">Approval Rate</p>
                  <p className="text-2xl font-bold text-emerald-900">{approvalRate}%</p>
                  <p className="text-xs text-emerald-600">
                    {approvedCount} approved, {totalResponded - approvedCount} rejected
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">Avg Response Time</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {avgResponseTime > 24 ? `${Math.round(avgResponseTime / 24)} days` : `${avgResponseTime} hours`}
                  </p>
                  <p className="text-xs text-blue-600">
                    Based on {responseTimes.length} responses
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Approval Requests */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Approval Requests</CardTitle>
            <Link to={createPageUrl('Approvals')}>
              <Button variant="outline" size="sm" className="gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No approval requests yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Client</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Action</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Requested By</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequests.map(request => {
                      const action = actionMap[request.action_id];
                      const client = action ? clientMap[action.client_id] : null;
                      const requestedBy = userMap[request.requestedBy];

                      return (
                        <tr 
                          key={request.id} 
                          className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                          onClick={() => window.location.href = createPageUrl('Approvals')}
                        >
                          <td className="py-3 px-4">
                            <span className="font-medium text-gray-900">
                              {client?.full_name || 'Unknown'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-700">{action?.title || 'Unknown'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-600">
                              {requestedBy?.full_name || request.requestedBy || 'Unknown'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-500 text-sm">
                              {format(new Date(request.requestedAt || request.created_date), 'MMM d, yyyy')}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={
                              request.status === 'Pending' 
                                ? 'bg-amber-100 text-amber-800' 
                                : request.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }>
                              {request.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}