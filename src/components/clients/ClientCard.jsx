
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Phone, Target, Video, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const statusColors = {
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
  prospect: "bg-blue-100 text-blue-800 border-blue-200",
};

export default function ClientCard({ client, onClick }) {
  const [showInstantMeet, setShowInstantMeet] = useState(false);
  const [meetData, setMeetData] = useState({ title: "", participant_emails: [] });
  const [isCreatingMeet, setIsCreatingMeet] = useState(false);
  const [meetError, setMeetError] = useState(null);
  const [meetSuccess, setMeetSuccess] = useState(null);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  const handleStartInstantMeet = (e) => {
    e.stopPropagation();
    setMeetData({
      title: `${client.full_name.split(' ')[0]} Coaching Session`,
      participant_emails: [client.email]
    });
    setMeetError(null);
    setMeetSuccess(null);
    setShowInstantMeet(true);
  };

  const createInstantMeet = async () => {
    setIsCreatingMeet(true);
    setMeetError(null);
    
    try {
      const response = await base44.functions.invoke('meet/createInstantSession', {
        client_id: client.id,
        title: meetData.title,
        coach_email: user?.email,
        participant_emails: meetData.participant_emails
      });

      if (response.data.success) {
        setMeetSuccess(response.data);
      } else {
        throw new Error(response.data.error || 'Failed to create meeting');
      }
    } catch (error) {
      setMeetError(error.response?.data?.error || error.message);
    } finally {
      setIsCreatingMeet(false);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card 
          className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
          onClick={onClick}
        >
          <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">
                  {client.full_name[0].toUpperCase()}
                </span>
              </div>
              <Badge variant="outline" className={statusColors[client.status]}>
                {client.status}
              </Badge>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">{client.full_name}</h3>
            
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="truncate">{client.email}</span>
              </div>
              {client.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.health_goals && (
                <div className="flex items-start gap-2 text-gray-600 mt-3 pt-3 border-t border-gray-100">
                  <Target className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{client.health_goals}</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleStartInstantMeet}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
              size="sm"
            >
              <Video className="w-4 h-4 mr-2" />
              Start Instant Meet
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showInstantMeet} onOpenChange={setShowInstantMeet}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Start Instant Meet with {client.full_name}</DialogTitle>
          </DialogHeader>

          {!meetSuccess ? (
            <div className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-sm text-blue-800">
                  This session will be recorded and auto-transcribed to create follow-up notes and tasks for care. By joining, participants consent to recording and processing.
                </AlertDescription>
              </Alert>

              {meetError && (
                <Alert variant="destructive">
                  <AlertDescription>{meetError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Session Title</Label>
                <Input
                  value={meetData.title}
                  onChange={(e) => setMeetData({ ...meetData, title: e.target.value })}
                  placeholder="Session title"
                />
              </div>

              <div className="space-y-2">
                <Label>Coach</Label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-600">Meeting host</p>
                  <p className="font-medium">{user?.email || 'Loading...'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Participants</Label>
                <Input
                  value={meetData.participant_emails.join(', ')}
                  onChange={(e) => setMeetData({ 
                    ...meetData, 
                    participant_emails: e.target.value.split(',').map(email => email.trim()) 
                  })}
                  placeholder="emails separated by comma"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowInstantMeet(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={createInstantMeet}
                  disabled={isCreatingMeet || !user}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600"
                >
                  {isCreatingMeet ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Meeting'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  ✓ Meeting created successfully!
                </AlertDescription>
              </Alert>

              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Meet Link:</p>
                  <p className="font-mono text-sm break-all">{meetSuccess.meet_join_link}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Host:</p>
                  <p className="font-medium">{meetSuccess.host}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Co-host:</p>
                  <p className="font-medium">{meetSuccess.cohost}</p>
                  {!meetSuccess.cohost_granted && (
                    <p className="text-xs text-amber-600 mt-1">
                      Note: Co-host requires Google account; can be promoted in-meeting
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status:</p>
                  <p className="font-medium capitalize">{meetSuccess.session.status}</p>
                </div>
              </div>

              <Button
                onClick={() => window.open(meetSuccess.meet_join_link, '_blank')}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600"
              >
                <Video className="w-4 h-4 mr-2" />
                Open Meet Now
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setShowInstantMeet(false);
                  setMeetSuccess(null);
                }}
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
