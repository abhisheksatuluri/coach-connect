import React, { useState } from "react";
import api from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen, Search, X, Tag, Eye, Calendar, FileText, Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [activeOnly, setActiveOnly] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [user, setUser] = useState(null);
  const currentView = localStorage.getItem('currentView') || 'coach';

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['knowledgeBase'],
    queryFn: () => api.entities.KnowledgeBase.list('-created_date'),
  });

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  const categories = ["Nutrition", "Sleep", "Exercise", "Mental Health", "Behavior Change", "Supplements", "Lab Results", "Other"];

  const categoryColors = {
    "Nutrition": "bg-green-100 text-green-800 border-green-200",
    "Sleep": "bg-indigo-100 text-indigo-800 border-indigo-200",
    "Exercise": "bg-orange-100 text-orange-800 border-orange-200",
    "Mental Health": "bg-purple-100 text-purple-800 border-purple-200",
    "Behavior Change": "bg-blue-100 text-blue-800 border-blue-200",
    "Supplements": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Lab Results": "bg-pink-100 text-pink-800 border-pink-200",
    "Other": "bg-gray-100 text-gray-800 border-gray-200"
  };

  const filteredArticles = articles.filter(article => {
    // Filter by active status (always filter for practitioners)
    if ((activeOnly || isPractitioner) && !article.is_active) return false;

    // Filter by category
    if (categoryFilter !== "All" && article.category !== categoryFilter) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = article.title?.toLowerCase().includes(query);
      const matchesSummary = article.summary?.toLowerCase().includes(query);
      const matchesTags = article.tags?.toLowerCase().includes(query);
      return matchesTitle || matchesSummary || matchesTags;
    }

    return true;
  });

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    // Increment view count
    api.entities.KnowledgeBase.update(article.id, {
      view_count: (article.view_count || 0) + 1
    });
  };

  const isAdmin = user?.role === 'admin';
  const isPractitioner = currentView === 'practitioner';
  const canEdit = isAdmin && !isPractitioner;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Health Coaching Knowledge Base</h1>
                <p className="text-gray-600">Reference materials for AI-powered session insights</p>
              </div>
            </div>
            {canEdit && (
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                + New Article
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search title, tags, or summary..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Only Toggle - only show for admins */}
            {canEdit && (
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activeOnly"
                  checked={activeOnly}
                  onChange={(e) => setActiveOnly(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="activeOnly" className="text-sm text-gray-700 cursor-pointer">
                  Show active articles only
                </label>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredArticles.length} of {articles.length} articles
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading knowledge base...</div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No knowledge base articles found</h3>
              <p className="text-gray-600">
                {searchQuery || categoryFilter !== "All"
                  ? "Try adjusting your filters or search query."
                  : isPractitioner
                    ? "No knowledge base articles available yet."
                    : "Add your first article to get started."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer h-full"
                  onClick={() => handleArticleClick(article)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={`${categoryColors[article.category]} border`}>
                        {article.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Eye className="w-3 h-3" />
                        {article.view_count || 0}
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {article.summary || article.content?.substring(0, 100) + '...'}
                    </p>

                    {/* Tags */}
                    {article.tags && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {article.tags.split(',').slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            <Tag className="w-3 h-3" />
                            {tag.trim()}
                          </span>
                        ))}
                        {article.tags.split(',').length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{article.tags.split(',').length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {article.source_type}
                      </span>
                      {article.created_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(article.created_date), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-t-2xl z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <Badge className={`${categoryColors[selectedArticle.category]} mb-3`}>
                      {selectedArticle.category}
                    </Badge>
                    <h2 className="text-2xl font-bold mb-2">{selectedArticle.title}</h2>

                    {/* Tags */}
                    {selectedArticle.tags && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedArticle.tags.split(',').map((tag, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 text-white text-xs rounded-full"
                          >
                            <Tag className="w-3 h-3" />
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-white/80">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {selectedArticle.source_type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {selectedArticle.view_count || 0} views
                      </span>
                      {selectedArticle.created_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(selectedArticle.created_date), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedArticle(null)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {selectedArticle.summary && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-emerald-900 mb-2">Summary</h3>
                    <p className="text-emerald-800">{selectedArticle.summary}</p>
                  </div>
                )}

                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Full Content</h3>
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedArticle.content}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-2xl flex justify-end">
                <Button
                  onClick={() => setSelectedArticle(null)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}