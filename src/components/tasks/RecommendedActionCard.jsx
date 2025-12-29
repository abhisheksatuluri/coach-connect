import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ExternalLink, User, MessageSquareQuote, Lightbulb, Clock, RefreshCw, UserCheck, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, isValid } from "date-fns";

const actionTypeLabels = {
  follow_up: "Follow Up",
  resource_sharing: "Resource Sharing",
  scheduling: "Scheduling",
  documentation: "Documentation",
  planning: "Planning",
  research: "Research",
  coordination: "Coordination",
  review: "Review",
  intervention_setup: "Intervention Setup",
  check_in: "Check In"
};

const actionTypeBorderColors = {
  follow_up: "border-l-blue-500",
  resource_sharing: "border-l-green-500",
  scheduling: "border-l-purple-500",
  documentation: "border-l-gray-500",
  planning: "border-l-teal-500",
  research: "border-l-orange-500",
  coordination: "border-l-pink-500",
  review: "border-l-yellow-500",
  intervention_setup: "border-l-red-500",
  check_in: "border-l-lime-500"
};

const actionTypeColors = {
  follow_up: "bg-blue-50 text-blue-700",
  resource_sharing: "bg-green-50 text-green-700",
  scheduling: "bg-purple-50 text-purple-700",
  documentation: "bg-gray-100 text-gray-700",
  planning: "bg-teal-50 text-teal-700",
  research: "bg-orange-50 text-orange-700",
  coordination: "bg-pink-50 text-pink-700",
  review: "bg-yellow-50 text-yellow-700",
  intervention_setup: "bg-red-50 text-red-700",
  check_in: "bg-lime-50 text-lime-700"
};

export default function RecommendedActionCard({ 
  action, 
  client, 
  session, 
  approvalRequest,
  practitioner,
  onAccept, 
  onDismiss,
  onRestore,
  onResendApproval,
  onCancelApproval,
  onRequestNewApproval,
  isResending = false,
  isCancelling = false,
  index = 0
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isDismissed = action.isDismissed;
  const isPending = action.approvalStatus === 'Pending';
  const isRejected = action.approvalStatus === 'Rejected';

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy') : null;
  };

  const borderColor = actionTypeBorderColors[action.actionType] || "border-l-gray-400";
  const typeColor = actionTypeColors[action.actionType] || "bg-gray-100 text-gray-700";

  // Use sourceContext from the action if available
  const clientQuote = action.sourceContext || null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isDismissed ? 0.5 : 1, x: 0 }}
      exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.03 }}
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        rounded-lg border border-l-4 ${borderColor}
        shadow-sm transition-all duration-200
        ${isDismissed ? 'bg-gray-100' : 'bg-white'}
        ${isHovered && !isDismissed ? 'shadow-lg' : 'hover:shadow-md'}
        overflow-hidden
      `}
    >
      {/* Default State - Always Visible */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold text-sm leading-tight ${isDismissed ? 'text-gray-500' : 'text-gray-900'}`}>
              {action.title}
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              {actionTypeLabels[action.actionType] || action.actionType}
              {isDismissed && <span className="ml-2 text-gray-400">(Dismissed)</span>}
            </p>
            {/* Approval Status Badges */}
            {isPending && (
              <div className="flex items-center gap-1 mt-1.5">
                <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs px-2 py-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Awaiting {action.requiredSpecialty} Approval
                </Badge>
              </div>
            )}
            {isRejected && (
              <div className="flex items-center gap-1 mt-1.5">
                <Badge className="bg-red-100 text-red-700 border-red-300 text-xs px-2 py-0.5 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Approval Declined
                </Badge>
              </div>
            )}
            <Link
              to={`${createPageUrl('Sessions')}?sessionId=${action.session_id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-blue-500 hover:text-blue-700 hover:underline mt-1 inline-block"
            >
              From: {session?.title || 'Unknown Session'}
              {session?.date_time && ` • ${formatDate(session.date_time)}`}
            </Link>
          </div>
          {isDismissed ? (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onRestore(action);
              }}
              className="flex-shrink-0 text-xs h-8"
            >
              Undo
            </Button>
          ) : isPending ? (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          ) : isRejected ? (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAccept(action);
              }}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-colors"
              title="Accept action"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded State - On Hover (only for non-dismissed) */}
      <AnimatePresence>
        {isHovered && !isDismissed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="border-t border-gray-100"
          >
            <div className="p-3 space-y-3 bg-gray-50/50">
              {/* Pending Approval Info */}
              {isPending && approvalRequest && (
                <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      Approval requested from {practitioner?.name || 'practitioner'}
                    </span>
                  </div>
                  <p className="text-xs text-amber-700">
                    Sent on {approvalRequest.requestedAt ? format(new Date(approvalRequest.requestedAt), 'MMM d, yyyy \'at\' h:mm a') : 'Unknown'}
                  </p>
                </div>
              )}

              {/* Rejected Approval Info */}
              {isRejected && approvalRequest && (
                <div className="bg-red-50 rounded-lg p-2.5 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      Declined by {practitioner?.name || 'practitioner'}
                    </span>
                  </div>
                  {approvalRequest.responseNotes && (
                    <div className="bg-white rounded p-2 mt-2 border border-red-100">
                      <p className="text-xs font-medium text-red-700 mb-1">Reason:</p>
                      <p className="text-sm text-red-800 italic">"{approvalRequest.responseNotes}"</p>
                    </div>
                  )}
                  {approvalRequest.respondedAt && (
                    <p className="text-xs text-red-600 mt-2">
                      Declined on {format(new Date(approvalRequest.respondedAt), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              )}

              {/* Description */}
              {action.description && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-medium text-gray-600">Why this action?</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              )}

              {/* Client Quote / Source Context */}
              <div className="bg-blue-50 rounded-lg p-2.5 border-l-4 border-blue-300">
                <div className="flex items-center gap-1.5 mb-1">
                  <MessageSquareQuote className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-medium text-blue-700">Based on</span>
                </div>
                {clientQuote ? (
                  <>
                    <p className="text-sm text-blue-800 italic">
                      "{clientQuote}"
                    </p>
                    <p className="text-xs text-blue-600 mt-1">— Client, during session</p>
                  </>
                ) : (
                  <Link
                    to={`${createPageUrl('Sessions')}?sessionId=${action.session_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    View session for full context →
                  </Link>
                )}
              </div>

              {/* Client Info */}
              {client && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    {client.profile_image ? (
                      <img 
                        src={client.profile_image} 
                        alt={client.full_name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xs font-medium">
                        {client.full_name?.[0]?.toUpperCase() || 'C'}
                      </span>
                    )}
                  </div>
                  <Link
                    to={`${createPageUrl('Clients')}?clientId=${client.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-gray-700 hover:text-purple-600 hover:underline"
                  >
                    {client.full_name}
                  </Link>
                </div>
              )}

              {/* Action Buttons - Pending State */}
              {isPending && (
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResendApproval?.(action, approvalRequest);
                    }}
                    disabled={isResending}
                    className="bg-amber-600 hover:bg-amber-700 text-white h-8 text-xs"
                  >
                    {isResending ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    )}
                    Resend Request
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancelApproval?.(action, approvalRequest);
                    }}
                    disabled={isCancelling}
                    className="text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 h-8 text-xs"
                  >
                    {isCancelling ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                    ) : (
                      <X className="w-3.5 h-3.5 mr-1" />
                    )}
                    Cancel Request
                  </Button>
                </div>
              )}

              {/* Action Buttons - Rejected State */}
              {isRejected && (
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestNewApproval?.(action);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs"
                  >
                    <UserCheck className="w-3.5 h-3.5 mr-1" />
                    Request Different Practitioner
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(action);
                    }}
                    className="text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 h-8 text-xs"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Dismiss
                  </Button>
                </div>
              )}

              {/* Action Buttons - Normal State */}
              {!isPending && !isRejected && (
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAccept(action);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(action);
                    }}
                    className="text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 h-8 text-xs"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Dismiss
                  </Button>
                  <Link
                    to={`${createPageUrl('Sessions')}?sessionId=${action.session_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="ml-auto"
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1" />
                      View Session
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}