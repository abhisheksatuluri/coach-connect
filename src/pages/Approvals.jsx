import React, { useState, useEffect } from "react";
import api from "@/api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Clock, User, Loader2, AlertCircle, Filter, Calendar, MessageSquare } from "lucide-react";
import { format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const [practitionerId, setPractitionerId] = useState(null);
  const [responseNotes, setResponseNotes] = useState({});
  const [processingId, setProcessingId] = useState(null);

  // Filters
  const [clientFilter, setClientFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const storedId = localStorage.getItem('viewingAsPractitionerId');
    if (storedId) {
      setPractitionerId(storedId);
    }
  }, []);

  const { data: approvalRequests = [], isLoading } = useQuery({
    queryKey: ['approvalRequests', practitionerId],
    queryFn: () => api.entities.ApprovalRequest.filter({ practitioner_id: practitionerId }),
    enabled: !!practitionerId
  });

  const { data: actions = [] } = useQuery({
    queryKey: ['actions'],
    queryFn: () => api.entities.Action.list(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.entities.Client.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.entities.User.list(),
  });

  const { data: practitioner } = useQuery({
    queryKey: ['practitioner', practitionerId],
    queryFn: () => api.entities.Practitioner.get(practitionerId),
    enabled: !!practitionerId
  });

  const actionMap = Object.fromEntries(actions.map(a => [a.id, a]));
  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.ApprovalRequest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvalRequests'] });
    }
  });

  const updateActionMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Action.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
    }
  });

  const sendNotificationEmail = async (request, decision) => {
    const action = actionMap[request.action_id];
    const client = action ? clientMap[action.client_id] : null;
    const coach = userMap[request.requestedBy];

    if (coach?.email) {
      await api.integrations.Core.SendEmail({
        to: coach.email,
        subject: `Approval ${decision}: ${action?.title || 'Action'}`,
        body: `
Hello ${coach.full_name || 'Coach'},

Your approval request has been ${decision.toLowerCase()} by ${practitioner?.name || 'the practitioner'}.

Action: ${action?.title || 'Unknown'}
Client: ${client?.full_name || 'Unknown'}
Decision: ${decision}
${responseNotes[request.id] ? `\nPractitioner Notes: ${responseNotes[request.id]}` : ''}

Best regards,
HealthCoach System
        `.trim()
      });
    }
  };

  const handleApprove = async (request) => {
    setProcessingId(request.id);
    await updateMutation.mutateAsync({
      id: request.id,
      data: {
        status: 'Approved',
        respondedAt: new Date().toISOString(),
        responseNotes: responseNotes[request.id] || ''
      }
    });

    if (request.action_id) {
      await updateActionMutation.mutateAsync({
        id: request.action_id,
        data: { approvalStatus: 'Approved' }
      });
    }

    await sendNotificationEmail(request, 'Approved');
    setProcessingId(null);
    setResponseNotes(prev => ({ ...prev, [request.id]: '' }));
  };

  const handleReject = async (request) => {
    setProcessingId(request.id);
    await updateMutation.mutateAsync({
      id: request.id,
      data: {
        status: 'Rejected',
        respondedAt: new Date().toISOString(),
        responseNotes: responseNotes[request.id] || ''
      }
    });

    if (request.action_id) {
      await updateActionMutation.mutateAsync({
        id: request.action_id,
        data: { approvalStatus: 'Rejected' }
      });
    }

    await sendNotificationEmail(request, 'Rejected');
    setProcessingId(null);
    setResponseNotes(prev => ({ ...prev, [request.id]: '' }));
  };

  // Filter logic
  const filterRequests = (requests) => {
    return requests.filter(request => {
      const action = actionMap[request.action_id];
      const clientId = action?.client_id;

      // Client filter
      if (clientFilter !== "all" && clientId !== clientFilter) return false;

      // Date filters
      const requestDate = new Date(request.requestedAt || request.created_date);
      if (dateFrom && isBefore(requestDate, startOfDay(new Date(dateFrom)))) return false;
      if (dateTo && isAfter(requestDate, endOfDay(new Date(dateTo)))) return false;

      return true;
    });
  };

  const filterHistoryRequests = (requests) => {
    let filtered = filterRequests(requests);

    // Status filter for history tab
    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    return filtered;
  };

  const pendingRequests = filterRequests(approvalRequests.filter(r => r.status === 'Pending'))
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const completedRequests = filterHistoryRequests(approvalRequests.filter(r => r.status !== 'Pending'))
    .sort((a, b) => new Date(b.respondedAt || b.updated_date) - new Date(a.respondedAt || a.updated_date));

  // Get unique clients from requests for filter dropdown
  const clientsInRequests = [...new Set(
    approvalRequests
      .map(r => actionMap[r.action_id]?.client_id)
      .filter(Boolean)
  )];

  if (!practitionerId) {
    return (
      <div className="p-8 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Practitioner Selected</h2>
              <p className="text-gray-600">Please select a practitioner from the dropdown in the header to view approval requests.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const FilterBar = ({ showStatusFilter = false }) => (
    <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600 font-medium">Filters:</span>
      </div>

      <Select value={clientFilter} onValueChange={setClientFilter}>
        <SelectTrigger className="w-[180px] h-9 bg-white">
          <SelectValue placeholder="All Clients" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Clients</SelectItem>
          {clientsInRequests.map(clientId => (
            <SelectItem key={clientId} value={clientId}>
              {clientMap[clientId]?.full_name || 'Unknown'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showStatusFilter && (
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] h-9 bg-white">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      )}

      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-[140px] h-9 bg-white"
          placeholder="From"
        />
        <span className="text-gray-400">-</span>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-[140px] h-9 bg-white"
          placeholder="To"
        />
      </div>

      {(clientFilter !== "all" || statusFilter !== "all" || dateFrom || dateTo) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setClientFilter("all");
            setStatusFilter("all");
            setDateFrom("");
            setDateTo("");
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );

  const PendingApprovalCard = ({ request }) => {
    const action = actionMap[request.action_id];
    const client = action ? clientMap[action.client_id] : null;
    const requestedBy = userMap[request.requestedBy];
    const isProcessing = processingId === request.id;

    return (
      <Card className="bg-white border-l-4 border-l-amber-400 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg text-gray-900">{action?.title || 'Unknown Action'}</CardTitle>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                {client && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium">{client.full_name}</span>
                  </div>
                )}
                {requestedBy && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MessageSquare className="w-4 h-4" />
                    <span>Requested by {requestedBy.full_name || requestedBy.email}</span>
                  </div>
                )}
              </div>
            </div>
            <Badge className="bg-amber-100 text-amber-800 shrink-0">
              <Clock className="w-3 h-3 mr-1" />
              Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {action?.description && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500 mb-1">Action Description</p>
              <p className="text-sm text-gray-700">{action.description}</p>
            </div>
          )}

          {action?.sourceContext && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">
                📝 Context from Session Transcript
              </p>
              <p className="text-sm text-blue-900 italic leading-relaxed">"{action.sourceContext}"</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm">
            {action?.actionType && (
              <Badge variant="outline" className="bg-white">{action.actionType}</Badge>
            )}
            {action?.priority && (
              <Badge variant="outline" className={`bg-white ${action.priority === 'High' ? 'border-red-300 text-red-700' :
                action.priority === 'Medium' ? 'border-amber-300 text-amber-700' :
                  'border-gray-300 text-gray-600'
                }`}>
                {action.priority} Priority
              </Badge>
            )}
            <span className="text-gray-500">
              Requested {format(new Date(request.requestedAt || request.created_date), 'MMM d, yyyy \'at\' h:mm a')}
            </span>
          </div>

          <div className="pt-2">
            <Textarea
              placeholder="Add notes for your decision (optional)..."
              value={responseNotes[request.id] || ''}
              onChange={(e) => setResponseNotes(prev => ({ ...prev, [request.id]: e.target.value }))}
              className="min-h-[80px] bg-gray-50"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleReject(request)}
              disabled={isProcessing}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 px-6"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-5 h-5 mr-2" />
              )}
              Decline
            </Button>
            <Button
              size="lg"
              onClick={() => handleApprove(request)}
              disabled={isProcessing}
              className="bg-emerald-600 hover:bg-emerald-700 px-6"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5 mr-2" />
              )}
              Approve
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const HistoryCard = ({ request }) => {
    const action = actionMap[request.action_id];
    const client = action ? clientMap[action.client_id] : null;
    const requestedBy = userMap[request.requestedBy];
    const isApproved = request.status === 'Approved';

    return (
      <Card className={`bg-white border-l-4 ${isApproved ? 'border-l-emerald-400' : 'border-l-red-400'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg text-gray-900">{action?.title || 'Unknown Action'}</CardTitle>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                {client && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium">{client.full_name}</span>
                  </div>
                )}
                {requestedBy && (
                  <span className="text-sm text-gray-500">
                    Requested by {requestedBy.full_name || requestedBy.email}
                  </span>
                )}
              </div>
            </div>
            <Badge className={isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
              {isApproved ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
              {request.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {request.responseNotes && (
            <div className="bg-gray-50 p-3 rounded-lg mb-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Your Notes:</p>
              <p className="text-sm text-gray-700">{request.responseNotes}</p>
            </div>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>
              Decided {format(new Date(request.respondedAt || request.updated_date), 'MMM d, yyyy \'at\' h:mm a')}
            </span>
            {action?.actionType && (
              <Badge variant="outline" className="text-xs">{action.actionType}</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Approval Requests</h1>
          <p className="text-gray-600 mt-1">
            {practitioner ? (
              <>Reviewing as <span className="font-medium text-emerald-700">{practitioner.name}</span></>
            ) : 'Loading...'}
            {practitioner?.specialty && (
              <Badge variant="outline" className="ml-2">{practitioner.specialty}</Badge>
            )}
          </p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Approval History ({completedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <FilterBar showStatusFilter={false} />

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : pendingRequests.length === 0 ? (
              <Card className="bg-emerald-50 border-emerald-100">
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">All Caught Up!</h3>
                  <p className="text-gray-600">No pending approval requests at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map(request => (
                  <PendingApprovalCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <FilterBar showStatusFilter={true} />

            {completedRequests.length === 0 ? (
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No completed requests match your filters.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedRequests.map(request => (
                  <HistoryCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}