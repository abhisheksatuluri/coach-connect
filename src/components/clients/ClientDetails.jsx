import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, Target, Calendar, AlertCircle, X, Edit, Trash2, User, CheckSquare, StickyNote, Pin, Plus } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ClientRecommendations from "./ClientRecommendations";
import NotesSection from "@/components/notes/NotesSection";
import FilesSection from "@/components/files/FilesSection";
import ClientChatSection from "./ClientChatSection";
import ClientPaymentsSection from "./ClientPaymentsSection";
import QuickPackageLinksSection from "@/components/payments/QuickPackageLinksSection";
import { setNoteContextClient, clearNoteContext } from "@/components/notes/useNoteContext";

const statusColors = {
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
  prospect: "bg-blue-100 text-blue-800 border-blue-200",
};

export default function ClientDetails({ client, onClose, onEdit, onDelete, sessions = [] }) {
  // Set note context and KB context when this client detail view is open
  useEffect(() => {
    if (client?.id) {
      setNoteContextClient(client.id);
      // Set global KB context
      window.__kbContext = { clientId: client.id };
      window.dispatchEvent(new CustomEvent('kbContextChanged'));
    }
    return () => {
      clearNoteContext();
      // Clear global KB context
      window.__kbContext = {};
      window.dispatchEvent(new CustomEvent('kbContextChanged'));
    };
  }, [client?.id]);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="border-b border-emerald-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">
                  {client.full_name[0].toUpperCase()}
                </span>
              </div>
              <div>
                <CardTitle className="text-2xl">{client.full_name}</CardTitle>
                <Badge variant="outline" className={`mt-2 ${statusColors[client.status]}`}>
                  {client.status}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardFooter className="flex justify-end gap-3 border-t border-emerald-100 p-6">
          <Button variant="outline" onClick={() => onDelete(client.id)} className="text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button onClick={() => onEdit(client)} className="bg-gradient-to-r from-emerald-500 to-teal-600">
            <Edit className="w-4 h-4 mr-2" />
            Edit Client
          </Button>
        </CardFooter>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="overview">
            <User className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <CheckSquare className="w-4 h-4 mr-2" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{client.email}</p>
                    </div>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{client.phone}</p>
                      </div>
                    </div>
                  )}
                  {client.date_of_birth && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium">{format(new Date(client.date_of_birth), 'MMMM d, yyyy')}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {client.emergency_contact && (
                    <div className="flex items-start gap-3 text-gray-700">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Emergency Contact</p>
                        <p className="font-medium">{client.emergency_contact}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {client.health_goals && (
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-emerald-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-emerald-900 mb-1">Health Goals</p>
                      <p className="text-gray-700">{client.health_goals}</p>
                    </div>
                  </div>
                </div>
              )}

              {client.notes && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-1">Notes</p>
                  <p className="text-gray-700">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* RECOMMENDATIONS TAB */}
        <TabsContent value="recommendations">
          <ClientRecommendations client={client} sessions={sessions} />
        </TabsContent>
      </Tabs>

      {/* Quick Package Links */}
      <QuickPackageLinksSection client={client} />

      {/* Payments Section */}
      <ClientPaymentsSection client={client} />

      {/* Chat Section */}
      <ClientChatSection clientId={client.id} clientEmail={client.email} />

      {/* Notes Section */}
      <NotesSection linkedClient={client.id} />

      {/* Files Section */}
      <FilesSection linkedClient={client.id} />
      </div>
      );
      }