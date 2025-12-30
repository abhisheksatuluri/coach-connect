import React, { useState, useEffect } from "react";
import api from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown } from "lucide-react";

const views = [
  { id: 'coach', label: '👨‍⚕️ Coach', shortLabel: '👨‍⚕️' },
  { id: 'practitioner', label: '🏥 Practitioner', shortLabel: '🏥' },
  { id: 'client', label: '👤 Client', shortLabel: '👤' }
];

export default function ViewSwitcher() {
  const [currentView, setCurrentView] = useState('coach');
  const [selectedPractitionerId, setSelectedPractitionerId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');

  const { data: practitioners = [] } = useQuery({
    queryKey: ['practitioners-view'],
    queryFn: () => api.entities.Practitioner.filter({ isActive: true }),
    enabled: currentView === 'practitioner'
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients-view'],
    queryFn: () => api.entities.Client.list(),
    enabled: currentView === 'client'
  });

  useEffect(() => {
    const stored = localStorage.getItem('currentView');
    if (stored && ['coach', 'practitioner', 'client'].includes(stored)) {
      setCurrentView(stored);
    }
    
    const storedPractitionerId = localStorage.getItem('viewingAsPractitionerId');
    if (storedPractitionerId) {
      setSelectedPractitionerId(storedPractitionerId);
    }
    
    const storedClientId = localStorage.getItem('viewingAsClientId');
    if (storedClientId) {
      setSelectedClientId(storedClientId);
    }
  }, []);

  const handleViewChange = (viewId) => {
    if (viewId === currentView) return;
    localStorage.setItem('currentView', viewId);
    setCurrentView(viewId);
    window.location.reload();
  };

  const handlePractitionerChange = (practitionerId) => {
    localStorage.setItem('viewingAsPractitionerId', practitionerId);
    setSelectedPractitionerId(practitionerId);
    window.location.reload();
  };

  const handleClientChange = (clientId) => {
    localStorage.setItem('viewingAsClientId', clientId);
    setSelectedClientId(clientId);
    window.location.reload();
  };

  const selectedPractitioner = practitioners.find(p => p.id === selectedPractitionerId);
  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="flex items-center gap-3">
      {/* Role-specific dropdown */}
      {currentView === 'practitioner' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 hidden sm:inline">Viewing as:</span>
          <Select value={selectedPractitionerId} onValueChange={handlePractitionerChange}>
            <SelectTrigger className="w-[180px] h-8 text-sm bg-white border-emerald-200">
              <SelectValue placeholder="Select Practitioner">
                {selectedPractitioner ? selectedPractitioner.name : "Select Practitioner"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {practitioners.length === 0 ? (
                <div className="px-2 py-3 text-sm text-gray-500 text-center">
                  No practitioners found
                </div>
              ) : (
                practitioners.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <span>{p.name}</span>
                      {p.specialty && (
                        <span className="text-xs text-gray-400">({p.specialty})</span>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {currentView === 'client' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 hidden sm:inline">Viewing as:</span>
          <Select value={selectedClientId} onValueChange={handleClientChange}>
            <SelectTrigger className="w-[180px] h-8 text-sm bg-white border-emerald-200">
              <SelectValue placeholder="Select Client">
                {selectedClient ? selectedClient.full_name : "Select Client"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {clients.length === 0 ? (
                <div className="px-2 py-3 text-sm text-gray-500 text-center">
                  No clients found
                </div>
              ) : (
                clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.full_name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* View switcher buttons */}
      <div className="flex items-center bg-gray-100 rounded-full p-1">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => handleViewChange(view.id)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
              ${currentView === view.id 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }
            `}
          >
            <span className="hidden sm:inline">{view.label}</span>
            <span className="sm:hidden">{view.shortLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}