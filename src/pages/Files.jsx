import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, 
  Plus,
  Upload,
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
  Loader2,
  X,
  Paperclip
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

export default function FilesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewFilter, setViewFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [currentUser, setCurrentUser] = useState(null);
  const [editingFileId, setEditingFileId] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editIsPrivate, setEditIsPrivate] = useState(true);
  const [editShareWithCoach, setEditShareWithCoach] = useState(false);
  const [editShareWithPractitioner, setEditShareWithPractitioner] = useState(false);
  const [editShareWithClient, setEditShareWithClient] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [shareWithCoach, setShareWithCoach] = useState(false);
  const [shareWithPractitioner, setShareWithPractitioner] = useState(false);
  const [shareWithClient, setShareWithClient] = useState(false);
  const [linkType, setLinkType] = useState("none");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedJourney, setSelectedJourney] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const currentView = localStorage.getItem('currentView') || 'coach';

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: allFiles = [], isLoading } = useQuery({
    queryKey: ['files-page', currentView],
    queryFn: () => base44.entities.File.list('-created_date', 500),
    enabled: !!currentUser
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.Session.list()
  });

  const { data: clientJourneys = [] } = useQuery({
    queryKey: ['client-journeys'],
    queryFn: () => base44.entities.ClientJourney.list()
  });

  const { data: journeys = [] } = useQuery({
    queryKey: ['journeys'],
    queryFn: () => base44.entities.Journey.list()
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.File.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files-page'] });
      alert('File deleted');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.File.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files-page'] });
      setEditingFileId(null);
      alert('File updated successfully');
    }
  });

  // Filter files based on privacy rules
  const accessibleFiles = allFiles.filter(file => {
    if (file.created_by === currentUser?.email) return true;
    if (file.isPrivate) return false;
    
    if (file.sharedWithRoles) {
      try {
        const sharedRoles = JSON.parse(file.sharedWithRoles);
        if (sharedRoles.includes(currentView)) return true;
      } catch (e) {}
    }
    
    if (file.sharedWithUsers) {
      try {
        const sharedUsers = JSON.parse(file.sharedWithUsers);
        if (sharedUsers.includes(currentUser?.email)) return true;
      } catch (e) {}
    }
    
    return false;
  });

  // Apply filters
  let filteredFiles = accessibleFiles;

  if (viewFilter === "my-uploads") {
    filteredFiles = filteredFiles.filter(f => f.created_by === currentUser?.email);
  } else if (viewFilter === "shared") {
    filteredFiles = filteredFiles.filter(f => f.created_by !== currentUser?.email);
  }

  if (typeFilter === "client") {
    filteredFiles = filteredFiles.filter(f => f.linkedClient && !f.linkedSession && !f.linkedJourney);
  } else if (typeFilter === "session") {
    filteredFiles = filteredFiles.filter(f => f.linkedSession);
  } else if (typeFilter === "journey") {
    filteredFiles = filteredFiles.filter(f => f.linkedJourney);
  } else if (typeFilter === "unlinked") {
    filteredFiles = filteredFiles.filter(f => !f.linkedClient && !f.linkedSession && !f.linkedJourney);
  }

  if (searchQuery.trim()) {
    filteredFiles = filteredFiles.filter(f => 
      f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  // Sort files
  if (sortBy === "date-desc") {
    filteredFiles.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  } else if (sortBy === "date-asc") {
    filteredFiles.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  } else if (sortBy === "name-asc") {
    filteredFiles.sort((a, b) => a.fileName.localeCompare(b.fileName));
  } else if (sortBy === "name-desc") {
    filteredFiles.sort((a, b) => b.fileName.localeCompare(a.fileName));
  } else if (sortBy === "size-asc") {
    filteredFiles.sort((a, b) => (a.fileSize || 0) - (b.fileSize || 0));
  } else if (sortBy === "size-desc") {
    filteredFiles.sort((a, b) => (b.fileSize || 0) - (a.fileSize || 0));
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentUser) return;
    
    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });
      
      const sharedRoles = [];
      if (!isPrivate) {
        if (shareWithCoach) sharedRoles.push('coach');
        if (shareWithPractitioner) sharedRoles.push('practitioner');
        if (shareWithClient) sharedRoles.push('client');
      }
      
      await base44.entities.File.create({
        fileName: selectedFile.name,
        fileUrl: file_url,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        description: description.trim() || null,
        uploadedByRole: currentView,
        linkedClient: linkType === "client" ? selectedClient : null,
        linkedSession: linkType === "session" ? selectedSession : null,
        linkedJourney: linkType === "journey" ? selectedJourney : null,
        isPrivate: isPrivate,
        sharedWithRoles: sharedRoles.length > 0 ? JSON.stringify(sharedRoles) : null,
        sharedWithUsers: null
      });
      
      resetUploadForm();
      queryClient.invalidateQueries({ queryKey: ['files-page'] });
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadForm = () => {
    setShowUploadForm(false);
    setSelectedFile(null);
    setDescription("");
    setIsPrivate(true);
    setShareWithCoach(false);
    setShareWithPractitioner(false);
    setShareWithClient(false);
    setLinkType("none");
    setSelectedClient("");
    setSelectedSession("");
    setSelectedJourney("");
  };

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

  const filteredSessions = sessions.filter(s => 
    !selectedClient || s.client_id === selectedClient
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Paperclip className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-gray-900">Files & Resources</h1>
          </div>
          <Button 
            onClick={() => setShowUploadForm(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600"
            disabled={showUploadForm}
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload File
          </Button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <Card className="bg-emerald-50 border-emerald-200">
            <CardHeader>
              <CardTitle>Upload New File</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="file-upload-main"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <label htmlFor="file-upload-main" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                  {selectedFile ? (
                    <p className="text-emerald-700 font-medium">{selectedFile.name}</p>
                  ) : (
                    <p className="text-gray-600">Click to browse or drag and drop</p>
                  )}
                </label>
              </div>

              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description (optional)..."
                className="bg-white"
                rows={2}
              />

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Link to:</label>
                  <Select value={linkType} onValueChange={setLinkType}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Standalone)</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="session">Session</SelectItem>
                      <SelectItem value="journey">Journey</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {linkType === "client" && (
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select a client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {linkType === "session" && (
                  <>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select a client first..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedClient && (
                      <Select value={selectedSession} onValueChange={setSelectedSession}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select a session..." />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredSessions.map(session => (
                            <SelectItem key={session.id} value={session.id}>
                              {session.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </>
                )}

                {linkType === "journey" && (
                  <Select value={selectedJourney} onValueChange={setSelectedJourney}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select a journey..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clientJourneys.map(cj => {
                        const journey = journeys.find(j => j.id === cj.journey_id);
                        const client = clients.find(c => c.id === cj.client_id);
                        return (
                          <SelectItem key={cj.id} value={cj.id}>
                            {client?.full_name || 'Unknown'} - {journey?.title || 'Unknown Journey'}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="upload-private" 
                    checked={isPrivate} 
                    onCheckedChange={setIsPrivate}
                  />
                  <label htmlFor="upload-private" className="text-sm font-medium cursor-pointer">
                    Keep private (only I can see)
                  </label>
                </div>

                {!isPrivate && (
                  <div className="pl-6 space-y-2">
                    <p className="text-sm text-gray-600 mb-2">Share with:</p>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="upload-share-coach" 
                        checked={shareWithCoach} 
                        onCheckedChange={setShareWithCoach}
                      />
                      <label htmlFor="upload-share-coach" className="text-sm cursor-pointer">
                        Coach
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="upload-share-practitioner" 
                        checked={shareWithPractitioner} 
                        onCheckedChange={setShareWithPractitioner}
                      />
                      <label htmlFor="upload-share-practitioner" className="text-sm cursor-pointer">
                        Practitioner
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="upload-share-client" 
                        checked={shareWithClient} 
                        onCheckedChange={setShareWithClient}
                      />
                      <label htmlFor="upload-share-client" className="text-sm cursor-pointer">
                        Client
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={resetUploadForm}
                  disabled={isUploading}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Tabs value={viewFilter} onValueChange={setViewFilter} className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="all">All Files</TabsTrigger>
            <TabsTrigger value="my-uploads">My Uploads</TabsTrigger>
            <TabsTrigger value="shared">Shared with Me</TabsTrigger>
          </TabsList>

          <TabsContent value={viewFilter} className="mt-4">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search files..."
                      className="pl-9"
                    />
                  </div>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="client">Client Files</SelectItem>
                      <SelectItem value="session">Session Files</SelectItem>
                      <SelectItem value="journey">Journey Files</SelectItem>
                      <SelectItem value="unlinked">Unlinked Files</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Newest First</SelectItem>
                      <SelectItem value="date-asc">Oldest First</SelectItem>
                      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                      <SelectItem value="size-asc">Size (Smallest)</SelectItem>
                      <SelectItem value="size-desc">Size (Largest)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center text-sm text-gray-600">
                    {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Files List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Paperclip className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-2">
                {searchQuery ? 'No files match your search' : 'No files yet'}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => setShowUploadForm(true)}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload your first file
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredFiles.map(file => {
              const FileIconComponent = getFileIcon(file.fileType);
              const canEditDelete = currentUser && file.created_by === currentUser.email;
              const linkedInfo = getLinkedInfo(file);

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
                            {linkedInfo ? (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">
                                  {linkedInfo.type}: {linkedInfo.name}
                                </Badge>
                              </>
                            ) : (
                              <>
                                <span>•</span>
                                <span className="text-gray-400">—</span>
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
    </div>
  );
}