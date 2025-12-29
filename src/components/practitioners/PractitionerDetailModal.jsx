import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Mail, Phone, Award } from "lucide-react";
import PractitionerChatSection from "./PractitionerChatSection";

export default function PractitionerDetailModal({ practitioner, onClose }) {
  if (!practitioner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <Card className="bg-white shadow-2xl">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {practitioner.name?.[0]?.toUpperCase() || 'P'}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-2xl">{practitioner.name}</CardTitle>
                  <Badge variant="outline" className="mt-2 bg-purple-50 text-purple-700 border-purple-200">
                    {practitioner.specialty}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Contact Information */}
            <Card className="bg-gray-50 border-0">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{practitioner.email}</p>
                  </div>
                </div>
                
                {practitioner.phone && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{practitioner.phone}</p>
                    </div>
                  </div>
                )}

                {practitioner.credentials && (
                  <div className="flex items-start gap-3 text-gray-700">
                    <Award className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Credentials</p>
                      <p className="font-medium">{practitioner.credentials}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat Section */}
            <PractitionerChatSection 
              practitionerId={practitioner.id}
              practitionerEmail={practitioner.email}
              practitionerName={practitioner.name}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}