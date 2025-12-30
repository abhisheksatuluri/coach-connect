import React, { useState } from "react";
import api from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  FileText,
  TrendingUp,
  AlertCircle,
  Link as LinkIcon,
  Plus,
  ArrowRight,
  Loader2,
  Receipt,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import PaymentLinksTab from "@/components/payments/PaymentLinksTab";
import InvoicesTab from "@/components/payments/InvoicesTab";
import PackagesTab from "@/components/payments/PackagesTab";
import RecordPaymentModal from "@/components/payments/RecordPaymentModal";
import { formatCurrency } from "@/components/payments/invoiceUtils";

function StatCard({ title, value, subtitle, icon: Icon, accentColor }) {
  return (
    <Card className="bg-white shadow-sm hover:shadow-lg transition-all duration-200 rounded-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accentColor}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ icon: Icon, description, client, amount, date, status, iconColor }) {
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">{description}</p>
        <p className="text-sm text-gray-500">{client}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900">{amount}</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
      {status && (
        <Badge variant={status === 'paid' ? 'success' : status === 'pending' ? 'warning' : 'default'}>
          {status}
        </Badge>
      )}
    </div>
  );
}

function QuickActionCard({ icon: Icon, title, description, onClick }) {
  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-emerald-200 rounded-lg" onClick={onClick}>
      <CardContent className="p-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="flex items-center text-emerald-600 text-sm font-medium">
          Get started <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showRecordPayment, setShowRecordPayment] = useState(false);

  // Fetch all payment data
  const { data: paymentLinks = [], isLoading: linksLoading } = useQuery({
    queryKey: ['payment-links'],
    queryFn: () => api.entities.PaymentLink.list(),
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.entities.Invoice.list(),
  });

  const { data: paymentRecords = [], isLoading: recordsLoading } = useQuery({
    queryKey: ['payment-records'],
    queryFn: () => api.entities.PaymentRecord.list(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.entities.Client.list(),
  });

  const { data: packages = [], isLoading: packagesLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: () => api.entities.Package.list(),
  });

  const { data: journeys = [] } = useQuery({
    queryKey: ['journeys'],
    queryFn: () => api.entities.Journey.list(),
  });

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));

  // Calculate stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisMonthRevenue = paymentRecords
    .filter(p => new Date(p.paymentDate) >= startOfMonth)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const outstanding = invoices
    .filter(i => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, i) => sum + (i.total || 0), 0);

  const activeLinks = paymentLinks.filter(l => l.status === 'active').length;

  const thisMonthInvoices = invoices.filter(i =>
    i.sent_at && new Date(i.sent_at) >= startOfMonth
  ).length;

  // Recent activity - combine and sort
  const recentActivity = [
    ...paymentRecords.slice(0, 5).map(p => ({
      type: 'payment',
      icon: DollarSign,
      iconColor: 'bg-green-500',
      description: 'Payment received',
      client: clientMap[p.client_id]?.full_name || 'Unknown',
      amount: formatCurrency(p.amount),
      date: format(new Date(p.paymentDate), 'MMM d'),
      status: 'paid',
      timestamp: new Date(p.paymentDate)
    })),
    ...invoices.slice(0, 5).map(i => ({
      type: 'invoice',
      icon: FileText,
      iconColor: 'bg-blue-500',
      description: `Invoice ${i.invoiceNumber}`,
      client: clientMap[i.client_id]?.full_name || 'Unknown',
      amount: formatCurrency(i.total),
      date: i.sent_at ? format(new Date(i.sent_at), 'MMM d') : format(new Date(i.created_date), 'MMM d'),
      status: i.status,
      timestamp: new Date(i.sent_at || i.created_date)
    }))
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  const isLoading = linksLoading || invoicesLoading || recordsLoading;

  return (
    <>
      {showRecordPayment && (
        <RecordPaymentModal
          isOpen={showRecordPayment}
          onClose={() => setShowRecordPayment(false)}
          clients={clients}
          invoices={invoices}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">Payments</h1>
              </div>
              <p className="text-gray-600 ml-15">Manage payment links, invoices, and track payments</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" /> Payment Link
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                <Plus className="w-4 h-4" /> New Invoice
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-white/60 backdrop-blur-sm">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payment-links">Payment Links</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      title="Total Revenue"
                      value={formatCurrency(thisMonthRevenue)}
                      subtitle="This month"
                      icon={TrendingUp}
                      accentColor="bg-gradient-to-br from-green-500 to-emerald-600"
                    />
                    <StatCard
                      title="Outstanding"
                      value={formatCurrency(outstanding)}
                      subtitle="Awaiting payment"
                      icon={AlertCircle}
                      accentColor="bg-gradient-to-br from-orange-500 to-amber-600"
                    />
                    <StatCard
                      title="Active Payment Links"
                      value={activeLinks}
                      subtitle="Currently active"
                      icon={LinkIcon}
                      accentColor="bg-gradient-to-br from-blue-500 to-indigo-600"
                    />
                    <StatCard
                      title="Invoices Sent"
                      value={thisMonthInvoices}
                      subtitle="This month"
                      icon={FileText}
                      accentColor="bg-gradient-to-br from-purple-500 to-pink-600"
                    />
                  </div>

                  {/* Recent Activity */}
                  <Card className="bg-white shadow-sm rounded-lg">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="flex items-center justify-between">
                        <span>Recent Activity</span>
                        <Button variant="ghost" size="sm" className="text-emerald-600">
                          View All <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {recentActivity.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">
                          <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No recent activity</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {recentActivity.map((activity, idx) => (
                            <ActivityItem
                              key={idx}
                              icon={activity.icon}
                              description={activity.description}
                              client={activity.client}
                              amount={activity.amount}
                              date={activity.date}
                              status={activity.status}
                              iconColor={activity.iconColor}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <QuickActionCard
                        icon={LinkIcon}
                        title="Create Payment Link"
                        description="Generate a secure payment link to send to clients"
                        onClick={() => setActiveTab('payment-links')}
                      />
                      <QuickActionCard
                        icon={FileText}
                        title="Generate Invoice"
                        description="Create and send professional invoices to clients"
                        onClick={() => setActiveTab('invoices')}
                      />
                      <QuickActionCard
                        icon={DollarSign}
                        title="Send Package Link"
                        description="Quick-send payment link for a package"
                        onClick={() => setActiveTab('packages')}
                      />
                      <QuickActionCard
                        icon={Receipt}
                        title="Record Payment"
                        description="Manually log payments received offline"
                        onClick={() => setShowRecordPayment(true)}
                      />
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Payment Links Tab */}
            <TabsContent value="payment-links">
              <PaymentLinksTab
                paymentLinks={paymentLinks}
                clients={clients}
                packages={packages}
                invoices={invoices}
                isLoading={linksLoading}
              />
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices">
              <InvoicesTab
                invoices={invoices}
                clients={clients}
                isLoading={invoicesLoading}
              />
            </TabsContent>

            {/* Packages Tab */}
            <TabsContent value="packages">
              <PackagesTab
                packages={packages}
                journeys={journeys}
                clients={clients}
                isLoading={packagesLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}