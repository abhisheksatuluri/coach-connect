import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, RefreshCw, Loader2, Calendar, Mail } from "lucide-react";

export default function GoogleConnectionStatus() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      const response = await base44.functions.invoke('googleOAuthInit');
      if (response.data?.authUrl) {
        window.location.href = response.data.authUrl;
      }
    } catch (err) {
      console.error('Failed to start OAuth:', err);
    } finally {
      setIsReconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  const isConnected = !!user?.google_access_token;
  const hasCalendarScope = isConnected; // Calendar is always included
  const hasGmailScope = isConnected && user?.google_scopes?.includes('gmail.send');
  
  // If user connected before Gmail scope was added, they need to reconnect
  const needsGmailReauth = isConnected && !hasGmailScope;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="flex items-center gap-2 text-lg">
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google" 
            className="w-5 h-5" 
          />
          Google Account
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {!isConnected ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">
              Connect your Google account to enable Calendar sync and email features.
            </p>
            <Button onClick={handleReconnect} disabled={isReconnecting}>
              {isReconnecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Connect Google Account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Connected</span>
              </div>
              <span className="text-sm text-green-700">{user.email}</span>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Permissions:</p>
              
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Google Calendar</span>
                </div>
                <Badge className="bg-green-100 text-green-700 border-0">
                  <Check className="w-3 h-3 mr-1" />
                  Granted
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Gmail (Send Emails)</span>
                </div>
                {hasGmailScope ? (
                  <Badge className="bg-green-100 text-green-700 border-0">
                    <Check className="w-3 h-3 mr-1" />
                    Granted
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 border-0">
                    <X className="w-3 h-3 mr-1" />
                    Not Granted
                  </Badge>
                )}
              </div>
            </div>

            {needsGmailReauth && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 mb-2">
                  Gmail permission is required to send emails to clients. Please reconnect to grant this permission.
                </p>
              </div>
            )}

            <Button 
              variant="outline" 
              onClick={handleReconnect} 
              disabled={isReconnecting}
              className="w-full"
            >
              {isReconnecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {needsGmailReauth ? 'Reconnect to Grant Gmail Access' : 'Reconnect Google Account'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}