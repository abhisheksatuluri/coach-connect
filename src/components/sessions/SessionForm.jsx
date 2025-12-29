import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Save, AlertCircle, Loader2, Clock } from "lucide-react";

export default function SessionForm({ session, clients, onSubmit, onCancel, onCreateSuccess }) {
  const [formData, setFormData] = useState(session || {
    client_id: "",
    title: "",
    date_time: "",
    duration: 60,
    notes: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (session) {
      onSubmit(formData);
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const user = await base44.auth.me();
      
      if (!user.google_connected) {
        setError('Please connect your Google account first to create sessions with Meet links.');
        setIsCreating(false);
        return;
      }

      const { data } = await base44.functions.invoke('createGoogleMeetSession', formData);

      if (data.needsAuth) {
        setError('Your Google authorization has expired. Please reconnect your account from the top of the page.');
        setIsCreating(false);
        return;
      }

      if (onCreateSuccess) {
        onCreateSuccess(data.session);
      }
      onCancel();
    } catch (error) {
      setError(error.response?.data?.error || error.message || 'Failed to create session');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="border-b border-blue-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">
            {session ? 'Edit Session' : 'Create New Session with Google Meet'}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>UK Time (GMT/BST)</span>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-6 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="client_id">Select Client *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({...formData, client_id: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Session Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                placeholder="Coaching Session with [Client Name]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_time">Date & Time (UK Time) *</Label>
              <Input
                id="date_time"
                type="datetime-local"
                value={formData.date_time}
                onChange={(e) => setFormData({...formData, date_time: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Session Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Notes about this session..."
              className="h-24"
            />
          </div>

          {!session && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                A Google Calendar event will be created automatically with a Meet link in UK timezone (GMT/BST), and your client will receive an email invitation.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t border-blue-100 p-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isCreating}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-blue-500 to-cyan-600"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Session...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {session ? 'Update' : 'Create'} Session
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}