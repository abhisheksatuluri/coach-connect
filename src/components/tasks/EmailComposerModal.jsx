import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Mail, Loader2, CheckCircle, AlertCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EmailComposerModal({ task, client, onClose, onSuccess }) {
  const [user, setUser] = useState(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null); // null, 'sending', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const [needsReauth, setNeedsReauth] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  
  const queryClient = useQueryClient();

  // Load current user (coach)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  // Generate email template when data is ready
  useEffect(() => {
    if (client && task && user) {
      const clientFirstName = client.full_name?.split(' ')[0] || client.full_name || 'there';
      const coachName = user.full_name || 'Your Coach';
      
      setSubject(task.title);
      
      const template = `Hi ${clientFirstName},

Following up from our recent session, I wanted to share this action item with you:

${task.title}${task.description ? `\n${task.description}` : ''}

Let me know if you have any questions!

Best,
${coachName}`;
      
      setMessage(template);
    }
  }, [client, task, user]);

  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      // Convert plain text to HTML (preserve line breaks)
      const htmlBody = message
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
      
      const response = await base44.functions.invoke('sendGmailEmail', {
        to: client.email,
        subject: subject,
        body: htmlBody,
        userId: user.id
      });
      
      if (!response.data?.success) {
        const error = new Error(response.data?.error || 'Failed to send email');
        error.needsReauth = response.data?.needsReauth;
        throw error;
      }
      
      return response.data;
    },
    onSuccess: async () => {
      // Update task with sent tracking
      try {
        await base44.entities.Action.update(task.id, {
          sentToClient: true,
          sentToClientAt: new Date().toISOString(),
          sentToClientSubject: subject
        });
        queryClient.invalidateQueries({ queryKey: ['actions'] });
      } catch (error) {
        console.error("Failed to update task:", error);
      }
      
      setStatus('success');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    },
    onError: (error, variables, context) => {
      setStatus('error');
      // Check if this is a permission error requiring reauth
      if (error.needsReauth || error.message?.includes('reconnect')) {
        setErrorMessage('Gmail access required. Please reconnect your Google account to grant email permissions.');
        setNeedsReauth(true);
      } else {
        setErrorMessage(error.message || 'Failed to send email. Please try again.');
      }
    }
  });

  const handleSend = () => {
    setStatus('sending');
    setErrorMessage("");
    sendEmailMutation.mutate();
  };

  if (!client?.email) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h2 className="text-lg font-semibold">No Email Address</h2>
            </div>
            <p className="text-gray-600 mb-4">
              This client doesn't have an email address on file. Please add their email in the client profile first.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">Close</Button>
              <Link 
                to={`${createPageUrl('Clients')}?clientId=${client?.id}`}
                className="flex-1"
              >
                <Button className="w-full">Edit Client Profile</Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6" />
                <h2 className="text-xl font-bold">Send to Client</h2>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="text-white hover:bg-white/20"
                disabled={status === 'sending'}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Success State */}
          {status === 'success' && (
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-green-600" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Sent Successfully!</h3>
              <p className="text-gray-600">Your message has been sent to {client.full_name}.</p>
            </div>
          )}

          {/* Form */}
          {status !== 'success' && (
            <>
              <div className="p-5 space-y-4">
                {/* Previous Send Warning */}
                {task.sentToClient && task.sentToClientAt && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      This task was already sent to the client on{' '}
                      <span className="font-semibold">
                        {format(new Date(task.sentToClientAt), 'MMM d, yyyy')}
                      </span>
                      . You can still send it again if needed.
                    </AlertDescription>
                  </Alert>
                )}

                {/* To Field */}
                <div className="space-y-2">
                  <Label htmlFor="to" className="text-sm font-medium text-gray-700">To</Label>
                  <Input
                    id="to"
                    value={client.email}
                    readOnly
                    className="bg-gray-50 text-gray-600"
                  />
                </div>

                {/* Subject Field */}
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject"
                    disabled={status === 'sending'}
                  />
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium text-gray-700">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message..."
                    className="min-h-[200px] resize-none"
                    disabled={status === 'sending'}
                  />
                </div>

                {/* Error Message */}
                {status === 'error' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                    {needsReauth && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
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
                        }}
                        disabled={isReconnecting}
                        className="mt-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        {isReconnecting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        Reconnect Google Account
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 flex items-center justify-end gap-3 bg-gray-50">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={status === 'sending'}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={status === 'sending' || !subject.trim() || !message.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {status === 'sending' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}