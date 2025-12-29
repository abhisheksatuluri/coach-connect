import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link2, CheckCircle, AlertCircle, Loader2, Unlink, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function GoogleConnectButton() {
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    checkAuthAndConnection();
    
    const handleMessage = (event) => {
      if (event.data.type === 'google-oauth-success') {
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        queryClient.invalidateQueries({ queryKey: ['user'] });
        checkAuthAndConnection();
      } else if (event.data.type === 'google-oauth-error') {
        setIsConnecting(false);
        setError(event.data.error || 'Failed to connect Google account');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkAuthAndConnection = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsConnected(!!currentUser?.google_connected);
      setError(null);
    } catch (error) {
      console.error('Error checking authentication:', error);
      setUser(null);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!user) {
      setError('Please sign in to connect your Google account');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('googleOAuthInit');
      
      if (response.status === 401) {
        setError('Please sign in to connect your Google account');
        setIsConnecting(false);
        return;
      }

      if (response.status !== 200 || !response.data.authUrl) {
        throw new Error(response.data?.error || 'Failed to initialize OAuth');
      }
      
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      window.open(
        response.data.authUrl,
        'Google OAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (error) {
      setIsConnecting(false);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to connect Google account';
      setError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Button disabled className="bg-gray-100">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (!user) {
    return (
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          Please sign in to connect your Google account and create sessions with Google Meet links.
        </AlertDescription>
      </Alert>
    );
  }

  const handleDisconnect = async () => {
    try {
      await base44.auth.updateMe({
        google_connected: false,
        google_access_token: null,
        google_refresh_token: null,
        google_token_expiry: null
      });
      setIsConnected(false);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    } catch (error) {
      setError('Failed to disconnect Google account');
    }
  };

  const handleReconnect = async () => {
    await handleDisconnect();
    setTimeout(() => {
      handleConnect();
    }, 500);
  };

  if (isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
            <CheckCircle className="w-4 h-4 mr-2" />
            Google Connected
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleReconnect} className="cursor-pointer">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reconnect (Update Permissions)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer text-red-600">
            <Unlink className="w-4 h-4 mr-2" />
            Disconnect Google
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm"
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Link2 className="w-4 h-4 mr-2" />
            Connect Google Account
          </>
        )}
      </Button>
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}