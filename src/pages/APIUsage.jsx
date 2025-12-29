import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, DollarSign, Zap, CheckCircle, XCircle, Loader2, Calendar } from "lucide-react";
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = {
  client: '#10b981',
  session: '#3b82f6',
  journey: '#8b5cf6',
  general: '#f59e0b'
};

export default function APIUsagePage() {
  const [functionFilter, setFunctionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch all API usage logs
  const { data: allLogs = [], isLoading } = useQuery({
    queryKey: ['apiUsageLogs'],
    queryFn: () => base44.entities.APIUsageLog.list('-requestedAt', 1000),
  });

  // Fetch clients, sessions, journeys for display names
  const { data: clients = [] } = useQuery({
    queryKey: ['clients-api'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions-api'],
    queryFn: () => base44.entities.Session.list(),
  });

  const { data: journeys = [] } = useQuery({
    queryKey: ['journeys-api'],
    queryFn: () => base44.entities.Journey.list(),
  });

  const { data: clientJourneys = [] } = useQuery({
    queryKey: ['clientJourneys-api'],
    queryFn: () => base44.entities.ClientJourney.list(),
  });

  // Helper to get object name
  const getObjectName = (log) => {
    if (!log.objectId) return '-';
    
    if (log.objectType === 'client') {
      const client = clients.find(c => c.id === log.objectId);
      return client?.full_name || 'Unknown Client';
    }
    
    if (log.objectType === 'session') {
      const session = sessions.find(s => s.id === log.objectId);
      return session?.title || 'Unknown Session';
    }
    
    if (log.objectType === 'journey') {
      const journey = journeys.find(j => j.id === log.objectId);
      if (journey) return journey.title;
      const clientJourney = clientJourneys.find(cj => cj.id === log.objectId);
      if (clientJourney) {
        const j = journeys.find(j => j.id === clientJourney.journey_id);
        return j?.title || 'Unknown Journey';
      }
      return 'Unknown Journey';
    }
    
    return '-';
  };

  // Calculate summary stats
  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekAgo = subDays(now, 7);
    const monthAgo = subDays(now, 30);

    const todayLogs = allLogs.filter(log => 
      new Date(log.requestedAt) >= todayStart
    );
    const weekLogs = allLogs.filter(log => 
      new Date(log.requestedAt) >= weekAgo
    );
    const monthLogs = allLogs.filter(log => 
      new Date(log.requestedAt) >= monthAgo
    );

    const sumTokensAndCost = (logs) => ({
      tokens: logs.reduce((sum, log) => sum + (log.totalTokens || 0), 0),
      cost: logs.reduce((sum, log) => sum + (log.estimatedCost || 0), 0)
    });

    return {
      today: sumTokensAndCost(todayLogs),
      week: sumTokensAndCost(weekLogs),
      month: sumTokensAndCost(monthLogs),
      allTime: sumTokensAndCost(allLogs)
    };
  }, [allLogs]);

  // Calculate daily usage for line chart (last 30 days)
  const dailyUsageData = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayLogs = allLogs.filter(log => {
        const logDate = new Date(log.requestedAt);
        return isWithinInterval(logDate, { start: dayStart, end: dayEnd });
      });

      days.push({
        date: format(date, 'MMM dd'),
        tokens: dayLogs.reduce((sum, log) => sum + (log.totalTokens || 0), 0),
        cost: dayLogs.reduce((sum, log) => sum + (log.estimatedCost || 0), 0)
      });
    }
    return days;
  }, [allLogs]);

  // Calculate usage by function for bar chart
  const functionUsageData = useMemo(() => {
    const byFunction = {};
    allLogs.forEach(log => {
      const fn = log.functionName || 'Unknown';
      if (!byFunction[fn]) {
        byFunction[fn] = { tokens: 0, cost: 0, count: 0 };
      }
      byFunction[fn].tokens += log.totalTokens || 0;
      byFunction[fn].cost += log.estimatedCost || 0;
      byFunction[fn].count += 1;
    });

    return Object.entries(byFunction).map(([name, data]) => ({
      name: name.replace('analyze', '').replace('KnowledgeBase', ' KB'),
      tokens: data.tokens,
      cost: data.cost,
      count: data.count
    })).sort((a, b) => b.tokens - a.tokens);
  }, [allLogs]);

  // Calculate usage by object type for pie chart
  const objectTypeData = useMemo(() => {
    const byType = {};
    allLogs.forEach(log => {
      const type = log.objectType || 'general';
      if (!byType[type]) {
        byType[type] = { tokens: 0, cost: 0 };
      }
      byType[type].tokens += log.totalTokens || 0;
      byType[type].cost += log.estimatedCost || 0;
    });

    return Object.entries(byType).map(([type, data]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: data.tokens,
      cost: data.cost
    }));
  }, [allLogs]);

  // Calculate estimated monthly cost
  const estimatedMonthlyCost = useMemo(() => {
    if (stats.week.cost === 0) return 0;
    // Average daily cost over last week * 30
    const avgDailyCost = stats.week.cost / 7;
    return avgDailyCost * 30;
  }, [stats]);

  // Filter and paginate logs for table
  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      if (functionFilter !== 'all' && log.functionName !== functionFilter) return false;
      if (statusFilter === 'success' && !log.success) return false;
      if (statusFilter === 'failed' && log.success) return false;
      return true;
    });
  }, [allLogs, functionFilter, statusFilter]);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const uniqueFunctions = [...new Set(allLogs.map(log => log.functionName))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-emerald-600" />
            API Usage Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Monitor OpenAI API token usage and costs</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Today's Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.today.cost.toFixed(4)}</div>
              <p className="text-xs opacity-90">{stats.today.tokens.toLocaleString()} tokens</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.week.cost.toFixed(4)}</div>
              <p className="text-xs opacity-90">{stats.week.tokens.toLocaleString()} tokens</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.month.cost.toFixed(4)}</div>
              <p className="text-xs opacity-90">{stats.month.tokens.toLocaleString()} tokens</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                All Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.allTime.cost.toFixed(4)}</div>
              <p className="text-xs opacity-90">{stats.allTime.tokens.toLocaleString()} tokens</p>
            </CardContent>
          </Card>
        </div>

        {/* Cost Projection */}
        {estimatedMonthlyCost > 0 && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Estimated Monthly Cost (based on last 7 days)</p>
                  <p className="text-2xl font-bold text-amber-700">${estimatedMonthlyCost.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Usage Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily Token Usage (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                  <YAxis style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tokens" stroke="#10b981" strokeWidth={2} name="Tokens" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Usage by Function Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usage by Function</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={functionUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" style={{ fontSize: '12px' }} />
                  <YAxis style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tokens" fill="#3b82f6" name="Tokens" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Object Type Pie Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Usage by Object Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={objectTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {objectTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()] || '#gray'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Log Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">API Call History</CardTitle>
              <div className="flex gap-2">
                <Select value={functionFilter} onValueChange={setFunctionFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by function" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Functions</SelectItem>
                    {uniqueFunctions.map(fn => (
                      <SelectItem key={fn} value={fn}>{fn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium">Date/Time</th>
                    <th className="text-left p-3 font-medium">Function</th>
                    <th className="text-left p-3 font-medium">Object</th>
                    <th className="text-left p-3 font-medium">Model</th>
                    <th className="text-right p-3 font-medium">Prompt</th>
                    <th className="text-right p-3 font-medium">Completion</th>
                    <th className="text-right p-3 font-medium">Total</th>
                    <th className="text-right p-3 font-medium">Cost</th>
                    <th className="text-right p-3 font-medium">Time (ms)</th>
                    <th className="text-center p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center py-8 text-gray-500">
                        No API calls found
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="p-3 text-gray-600">
                          {format(new Date(log.requestedAt), 'MMM dd, HH:mm')}
                        </td>
                        <td className="p-3 text-gray-900 font-medium">
                          {log.functionName}
                        </td>
                        <td className="p-3 text-gray-600">
                          {getObjectName(log)}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{log.model}</Badge>
                        </td>
                        <td className="p-3 text-right text-gray-600">
                          {log.promptTokens?.toLocaleString()}
                        </td>
                        <td className="p-3 text-right text-gray-600">
                          {log.completionTokens?.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-medium text-gray-900">
                          {log.totalTokens?.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-medium text-emerald-700">
                          ${log.estimatedCost?.toFixed(4)}
                        </td>
                        <td className="p-3 text-right text-gray-600">
                          {log.responseTime || '-'}
                        </td>
                        <td className="p-3 text-center">
                          {log.success ? (
                            <CheckCircle className="w-4 h-4 text-green-600 inline" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600 inline" />
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} calls
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}