import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, isValid } from "date-fns";
import { Video, Calendar, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function UpcomingSessions({ sessions, clients }) {
  const upcomingSessions = sessions
    .filter(s => {
      if (s.status !== 'upcoming') return false;
      if (!s.date_time) return false;
      const date = new Date(s.date_time);
      return isValid(date) && isAfter(date, new Date());
    })
    .slice(0, 5);

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.full_name || 'Unknown Client';
  };

  const formatDate = (dateString, formatString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isValid(date) ? format(date, formatString) : 'N/A';
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Video className="w-5 h-5 text-blue-600" />
          Upcoming Sessions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {upcomingSessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all duration-200"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{session.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{getClientName(session.client_id)}</p>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(session.date_time, 'MMM d, yyyy')}
                  </span>
                  <span>{formatDate(session.date_time, 'h:mm a')}</span>
                  <Badge variant="outline" className="bg-white">
                    {session.duration || 30} min
                  </Badge>
                </div>
              </div>
              {session.meet_link && (
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-4"
                  onClick={() => window.open(session.meet_link, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Join
                </Button>
              )}
            </motion.div>
          ))}
          {upcomingSessions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Video className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No upcoming sessions scheduled</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}