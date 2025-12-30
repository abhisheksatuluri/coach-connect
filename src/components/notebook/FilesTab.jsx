import React, { useState, useEffect } from "react";
import api from "@/api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, 
  Download, 
  Trash2, 
  Edit2,
  Search,
  FileImage,
  FileVideo,
  FileAudio,
  File as FileIcon,
  Lock,
  Users,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

const getFileIcon = (fileType) => {
  if (!fileType) return FileIcon;
  if (fileType.startsWith('image/')) return FileImage;
  if (fileType.startsWith('video/')) return FileVideo;
  if (fileType.startsWith('audio/')) return FileAudio;
  if (fileType.includes('pdf')) return FileText;
  return FileIcon;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

export default function FilesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewFilter, setViewFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  const [editingFileId, setEditingFileId] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editIsPrivate, setEditIsPrivate] = useState(true);
  const [editShareWithCoach, setEditShareWithCoach] = useState(false);
  const [editShareWithPractitioner, setEditShareWithPractitioner] = useState(false);
  const [editShareWithClient, setEditShareWithClient] = useState(false);
  const queryClient = useQueryClient();

  const currentView = localStorage.getItem('currentView') || 'coach';

  useEffect(() => {
    const loadUser = async () => {
      const user = await api.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: allFiles = [], isLoading } = useQuery({
    queryKey: ['files-notebook', currentView],
    queryFn: () => api.entities.File.list('-created_date', 200),
    enabled: !!currentUser
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.entities.Client.list()
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.entities.Session.list()
  });

  const { data: clientJourneys = [] } = useQuery({
    queryKey: ['client-journeys'],
    queryFn: () => api.entities.ClientJourney.list()
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.File.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files-notebook'] });
      alert('File deleted');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.File.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files-notebook'] });
      setEditingFileId(null);
      alert('File updated successfully');
    }
  });

  // Filter files based on privacy rules
  const accessibleFiles = allFiles.filter(file => {
    // User can see their own files
    if (file.created_by === currentUser?.email) return true;
    
    // If file is private, only uploader can see it
    if (file.isPrivate) return false;
    
    // Check if shared with current user's role
    if (file.sharedWithRoles) {
      try {
        const sharedRoles = JSON.parse(file.sharedWithRoles);
        if (sharedRoles.includes(currentView)) return true;
      } catch (e) {
        // Invalid JSON, skip
      }
    }
    
    // Check if shared with current user specifically
    if (file.sharedWithUsers) {
      try {
        const sharedUsers = JSON.parse(file.sharedWithUsers);
        if (sharedUsers.includes(currentUser?.email)) return true;
      } catch (e) {
        // Invalid JSON, skip
      }
    }
    
    return false;
  });

  // Apply filters
  let filteredFiles = accessibleFiles;

  // View filter
  if (viewFilter === "my-uploads") {
    filteredFiles = filteredFiles.filter(f => f.created_by === currentUser?.email);
  } else if (viewFilter === "shared") {
    filteredFiles = filteredFiles.filter(f => f.created_by !== currentUser?.email);
  }

  // Type filter
  if (typeFilter === "client") {
    filteredFiles = filteredFiles.filter(f => f.linkedClient && !f.linkedSession && !f.linkedJourney);
  } else if (typeFilter === "session") {
    filteredFiles = filteredFiles.filter(f => f.linkedSession);
  } else if (typeFilter === "journey") {
    filteredFiles = filteredFiles.filter(f => f.linkedJourney);
  }

  // Search filter
  if (searchQuery.trim()) {
    filteredFiles = filteredFiles.filter(f => 
      f.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const handleDownload = (file) => {
    window.open(file.fileUrl, '_blank');
  };

  const handleDelete = async (file) => {
    if (confirm(`Are you sure you want to delete ${file.fileName}?`)) {
      await deleteMutation.mutateAsync(file.id);
    }
  };

  const handleStartEdit = (file) => {
    setEditingFileId(file.id);
    setEditDescription(file.description || "");
    setEditIsPrivate(file.isPrivate ?? true);
    
    try {
      const sharedRoles = file.sharedWithRoles ? JSON.parse(file.sharedWithRoles) : [];
      setEditShareWithCoach(sharedRoles.includes('coach'));
      setEditShareWithPractitioner(sharedRoles.includes('practitioner'));
      setEditShareWithClient(sharedRoles.includes('client'));
    } catch {
      setEditShareWithCoach(false);
      setEditShareWithPractitioner(false);
      setEditShareWithClient(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingFileId(null);
    setEditDescription("");
    setEditIsPrivate(true);
    setEditShareWithCoach(false);
    setEditShareWithPractitioner(false);
    setEditShareWithClient(false);
  };

  const handleSaveEdit = async (fileId) => {
    const sharedRoles = [];
    if (!editIsPrivate) {
      if (editShareWithCoach) sharedRoles.push('coach');
      if (editShareWithPractitioner) sharedRoles.push('practitioner');
      if (editShareWithClient) sharedRoles.push('client');
    }

    const updateData = {
      description: editDescription.trim() || null,
      isPrivate: editIsPrivate,
      sharedWithRoles: sharedRoles.length > 0 ? JSON.stringify(sharedRoles) : null
    };

    await updateMutation.mutateAsync({ id: fileId, data: updateData });
  };

  const getLinkedInfo = (file) => {
    if (file.linkedSession) {
      const session = sessions.find(s => s.id === file.linkedSession);
      return { type: 'Session', name: session?.title || 'Unknown Session' };
    }
    if (file.linkedJourney) {
      const journey = clientJourneys.find(j => j.id === file.linkedJourney);
      const client = clients.find(c => c.id === journey?.client_id);
      return { type: 'Journey', name: client ? `${client.full_name}'s Journey` : 'Unknown Journey' };
    }
    if (file.linkedClient) {
      const client = clients.find(c => c.id === file.linkedClient);
      return { type: 'Client', name: client?.full_name || 'Unknown Client' };
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="pl-9"
              />
            </div>

            {/* View Filter */}
            <Select value={viewFilter} onValueChange={setViewFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Files</SelectItem>
                <SelectItem value="my-uploads">My Uploads</SelectItem>
                <SelectItem value="shared">Shared with Me</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="client">Client Files</SelectItem>
                <SelectItem value="session">Session Files</SelectItem>
                <SelectItem value="journey">Journey Files</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-gray-600">
            {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'} found
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">
              {searchQuery ? 'No files match your search' : 'No files found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredFiles.map(file => {
            const FileIconComponent = getFileIcon(file.fileType);
            const canEditDelete = currentUser && file.created_by === currentUser.email;
            const linkedInfo = getLinkedInfo(file);

            // Show edit form
            if (editingFileId === file.id) {
              return (
                <Card key={file.id} className="bg-amber-50 border-amber-300 border-2">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <FileIconComponent className="w-4 h-4 text-amber-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">{file.fileName}</h4>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Description
                      </label>
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Add a description..."
                        className="bg-white"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`edit-private-${file.id}`}
                          checked={editIsPrivate}
                          onCheckedChange={setEditIsPrivate}
                        />
                        <label htmlFor={`edit-private-${file.id}`} className="text-sm font-medium cursor-pointer">
                          Keep private (only I can see this file)
                        </label>
                      </div>

                      {!editIsPrivate && (
                        <div className="pl-6 space-y-2">
                          <p className="text-sm text-gray-600 mb-2">Share with:</p>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`edit-share-coach-${file.id}`}
                              checked={editShareWithCoach}
                              onCheckedChange={setEditShareWithCoach}
                            />
                            <label htmlFor={`edit-share-coach-${file.id}`} className="text-sm cursor-pointer">
                              Coach
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`edit-share-practitioner-${file.id}`}
                              checked={editShareWithPractitioner}
                              onCheckedChange={setEditShareWithPractitioner}
                            />
                            <label htmlFor={`edit-share-practitioner-${file.id}`} className="text-sm cursor-pointer">
                              Practitioner
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`edit-share-client-${file.id}`}
                              checked={editShareWithClient}
                              onCheckedChange={setEditShareWithClient}
                            />
                            <label htmlFor={`edit-share-client-${file.id}`} className="text-sm cursor-pointer">
                              Client
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={updateMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(file.id)}
                        disabled={updateMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {updateMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            // Show file card
            return (
              <Card 
                key={file.id}
                className="bg-white/90 backdrop-blur-sm border-0 shadow hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleDownload(file)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileIconComponent className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate mb-1">{file.fileName}</h4>
                        {file.description && (
                          <p className="text-sm text-gray-600 mb-2">{file.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                          <span>{formatFileSize(file.fileSize)}</span>
                          <span>•</span>
                          <span>{format(new Date(file.created_date), 'MMM d, yyyy')}</span>
                          {linkedInfo && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {linkedInfo.type}: {linkedInfo.name}
                              </Badge>
                            </>
                          )}
                          <span>•</span>
                          <span>by {file.created_by === currentUser?.email ? 'me' : file.created_by}</span>
                          <span>•</span>
                          {file.isPrivate ? (
                            <span className="flex items-center gap-1 text-gray-600">
                              <Lock className="w-3 h-3" />
                              Private
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <Users className="w-3 h-3" />
                              Shared
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(file)}
                        className="h-8"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      {canEditDelete && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartEdit(file)}
                            className="h-8"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(file)}
                            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}