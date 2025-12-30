import React, { useState, useEffect } from "react";
import api from "@/api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, 
  Plus, 
  Upload, 
  Download, 
  Trash2, 
  X, 
  Loader2,
  FileImage,
  FileVideo,
  FileAudio,
  File as FileIcon,
  Lock,
  Users,
  Edit2
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

export default function FilesSection({ 
  linkedClient, 
  linkedSession, 
  linkedJourney,
  title = "Files & Resources" 
}) {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [shareWithCoach, setShareWithCoach] = useState(false);
  const [shareWithPractitioner, setShareWithPractitioner] = useState(false);
  const [shareWithClient, setShareWithClient] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  // Build query filter
  const fileFilter = {};
  if (linkedSession) fileFilter.linkedSession = linkedSession;
  else if (linkedJourney) fileFilter.linkedJourney = linkedJourney;
  else if (linkedClient) fileFilter.linkedClient = linkedClient;

  // Fetch files
  const { data: allFiles = [] } = useQuery({
    queryKey: ['files', 'section', linkedClient, linkedSession, linkedJourney],
    queryFn: () => api.entities.File.filter(fileFilter),
    enabled: !!(linkedClient || linkedSession || linkedJourney)
  });

  // Filter files based on privacy rules
  const files = allFiles.filter(file => {
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

  // Sort files by created date descending
  const sortedFiles = [...files].sort((a, b) => 
    new Date(b.created_date) - new Date(a.created_date)
  );

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.File.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      alert('File deleted');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.File.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setEditingFileId(null);
      alert('File updated successfully');
    }
  });

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
      // Upload file to storage
      const { file_url } = await api.integrations.Core.UploadFile({ file: selectedFile });
      
      // Build shared roles array
      const sharedRoles = [];
      if (!isPrivate) {
        if (shareWithCoach) sharedRoles.push('coach');
        if (shareWithPractitioner) sharedRoles.push('practitioner');
        if (shareWithClient) sharedRoles.push('client');
      }
      
      // Create file record
      await api.entities.File.create({
        fileName: selectedFile.name,
        fileUrl: file_url,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        description: description.trim() || null,
        uploadedByRole: currentView,
        linkedClient: linkedClient || null,
        linkedSession: linkedSession || null,
        linkedJourney: linkedJourney || null,
        isPrivate: isPrivate,
        sharedWithRoles: sharedRoles.length > 0 ? JSON.stringify(sharedRoles) : null,
        sharedWithUsers: null
      });
      
      // Reset form
      setSelectedFile(null);
      setDescription("");
      setIsPrivate(true);
      setShareWithCoach(false);
      setShareWithPractitioner(false);
      setShareWithClient(false);
      setShowUploadForm(false);
      
      queryClient.invalidateQueries({ queryKey: ['files'] });
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (file) => {
    window.open(file.fileUrl, '_blank');
  };

  const handleDelete = async (file, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      await deleteMutation.mutateAsync(file.id);
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
  };

  const handleStartEdit = (file) => {
    setEditingFileId(file.id);
    setEditDescription(file.description || "");
    setEditIsPrivate(file.isPrivate ?? true);
    
    // Parse shared roles
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
    // Build shared roles array
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

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="border-b border-emerald-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-xl">{title}</CardTitle>
            {files.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {files.length}
              </Badge>
            )}
          </div>
          <Button 
            onClick={() => setShowUploadForm(true)}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={showUploadForm}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add File
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Upload Form */}
        {showUploadForm && (
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-4 space-y-4">
              <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
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
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="private" 
                    checked={isPrivate} 
                    onCheckedChange={setIsPrivate}
                  />
                  <label htmlFor="private" className="text-sm font-medium cursor-pointer">
                    Keep private (only I can see)
                  </label>
                </div>

                {!isPrivate && (
                  <div className="pl-6 space-y-2">
                    <p className="text-sm text-gray-600 mb-2">Share with:</p>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="share-coach" 
                        checked={shareWithCoach} 
                        onCheckedChange={setShareWithCoach}
                      />
                      <label htmlFor="share-coach" className="text-sm cursor-pointer">
                        Coach
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="share-practitioner" 
                        checked={shareWithPractitioner} 
                        onCheckedChange={setShareWithPractitioner}
                      />
                      <label htmlFor="share-practitioner" className="text-sm cursor-pointer">
                        Practitioner
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="share-client" 
                        checked={shareWithClient} 
                        onCheckedChange={setShareWithClient}
                      />
                      <label htmlFor="share-client" className="text-sm cursor-pointer">
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

        {/* Files List */}
        {sortedFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No files yet. Click 'Add File' to upload one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedFiles.map(file => {
              const FileIconComponent = getFileIcon(file.fileType);
              const canEditDelete = currentUser && file.created_by === currentUser.email;
              
              // Show edit form if this file is being edited
              if (editingFileId === file.id) {
                return (
                  <Card 
                    key={file.id}
                    className="bg-amber-50 border-amber-300 border-2"
                  >
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
                  className="bg-gray-50 hover:bg-gray-100 transition-colors border-gray-200"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileIconComponent className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{file.fileName}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                            <span>{formatFileSize(file.fileSize)}</span>
                            <span>•</span>
                            <span>{format(new Date(file.created_date), 'MMM d, yyyy')}</span>
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
                          {file.description && (
                            <p className="text-sm text-gray-600 mt-2">{file.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(file)}
                          className="h-8"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
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
                              onClick={(e) => handleDelete(file, e)}
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
      </CardContent>
    </Card>
  );
}