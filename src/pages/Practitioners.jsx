import React, { useState } from "react";
import api from "@/api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, UserCheck, Users, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import PractitionerFormModal from "@/components/practitioners/PractitionerFormModal";
import PractitionerDetailModal from "@/components/practitioners/PractitionerDetailModal";

const specialties = [
  "Dietitian",
  "Nutritionist",
  "Therapist",
  "Doctor",
  "Physiotherapist",
  "Counselor"
];

export default function PractitionersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPractitioner, setEditingPractitioner] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedPractitioner, setSelectedPractitioner] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: practitioners = [], isLoading } = useQuery({
    queryKey: ['practitioners'],
    queryFn: () => api.entities.Practitioner.list('-created_date'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Practitioner.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practitioners'] });
    },
  });

  // Filter practitioners
  const filteredPractitioners = practitioners
    .filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialty = specialtyFilter === "all" || p.specialty === specialtyFilter;
      return matchesSearch && matchesSpecialty;
    });

  const handleToggleActive = (practitioner) => {
    updateMutation.mutate({
      id: practitioner.id,
      data: { isActive: !practitioner.isActive }
    }, {
      onSuccess: () => {
        toast({
          title: practitioner.isActive ? "Practitioner deactivated" : "Practitioner activated",
          duration: 2000,
        });
      }
    });
  };

  const handleEdit = (practitioner) => {
    setEditingPractitioner(practitioner);
    setShowFormModal(true);
  };

  const handleDelete = (practitioner) => {
    if (confirm("Are you sure? This will not affect past approval requests.")) {
      updateMutation.mutate({
        id: practitioner.id,
        data: { isActive: false }
      }, {
        onSuccess: () => {
          toast({
            title: "Practitioner removed",
            duration: 2000,
          });
        }
      });
    }
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setEditingPractitioner(null);
    queryClient.invalidateQueries({ queryKey: ['practitioners'] });
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Practitioners</h1>
            <p className="text-gray-600 mt-1">Manage practitioners for action approvals</p>
          </div>
          <Button
            onClick={() => {
              setEditingPractitioner(null);
              setShowFormModal(true);
            }}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Practitioner
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Practitioners Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-0">
            {filteredPractitioners.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Credentials</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPractitioners.map((practitioner) => (
                    <TableRow key={practitioner.id} className={!practitioner.isActive ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {practitioner.name?.[0]?.toUpperCase() || 'P'}
                            </span>
                          </div>
                          {practitioner.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {practitioner.specialty || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">{practitioner.email}</TableCell>
                      <TableCell className="text-gray-600">{practitioner.phone || '-'}</TableCell>
                      <TableCell className="text-gray-600 max-w-[200px] truncate">
                        {practitioner.credentials || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={practitioner.isActive !== false}
                            onCheckedChange={() => handleToggleActive(practitioner)}
                          />
                          <span className={`text-sm ${practitioner.isActive !== false ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {practitioner.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedPractitioner(practitioner)}
                            className="hover:bg-purple-50 hover:text-purple-600"
                            title="View details & chat"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(practitioner)}
                            className="hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(practitioner)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No practitioners found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchQuery || specialtyFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Add your first practitioner to get started"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Modal */}
        {showFormModal && (
          <PractitionerFormModal
            practitioner={editingPractitioner}
            onClose={() => {
              setShowFormModal(false);
              setEditingPractitioner(null);
            }}
            onSuccess={handleFormSuccess}
          />
        )}

        {/* Detail Modal with Chat */}
        {selectedPractitioner && (
          <PractitionerDetailModal
            practitioner={selectedPractitioner}
            onClose={() => setSelectedPractitioner(null)}
          />
        )}
      </div>
    </div>
  );
}