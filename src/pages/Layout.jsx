
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Users,
  Video,
  LogOut,
  Heart,
  CheckCircle,
  BookOpen,
  MapIcon,
  UserCheck,
  NotebookPen,
  ClipboardCheck,
  MessageCircle,
  CreditCard
} from "lucide-react";
import FloatingNotesButton from "@/components/notes/FloatingNotesButton";
import NotesSlider from "@/components/notes/NotesSlider";
import FloatingKBButton from "@/components/knowledgebase/FloatingKBButton";
import KnowledgeBaseSlider from "@/components/knowledgebase/KnowledgeBaseSlider";
import FloatingTasksButton from "@/components/tasks/FloatingTasksButton";
import TasksSlider from "@/components/tasks/TasksSlider";
import ViewSwitcher from "@/components/layout/ViewSwitcher";
import ChatWidget from "@/components/chat/ChatWidget";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Paperclip, BarChart3, MoreHorizontal } from "lucide-react";
import { CURRENT_USER, CHATS } from "@/data/testData";

const allNavigationItems = [
  {
    title: "Dashboard",
    pageName: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    views: ['coach', 'practitioner', 'client']
  },
  {
    title: "Clients",
    pageName: "Clients",
    url: createPageUrl("Clients"),
    icon: Users,
    views: ['coach', 'practitioner']
  },
  {
    title: "Clients V2 🚀",
    pageName: "ClientsV2",
    url: createPageUrl("ClientsV2"),
    icon: Users,
    views: ['coach', 'practitioner']
  },
  {
    title: "Sessions",
    pageName: "Sessions",
    url: createPageUrl("Sessions"),
    icon: Video,
    views: ['coach']
  },
  {
    title: "Sessions V2 🚀",
    pageName: "SessionsV2",
    url: createPageUrl("SessionsV2"),
    icon: Video,
    views: ['coach']
  },
  {
    title: "My Sessions",
    pageName: "ClientSessions",
    url: createPageUrl("ClientSessions"),
    icon: Video,
    views: ['client']
  },
  {
    title: "Journeys",
    pageName: "Journeys",
    url: createPageUrl("Journeys"),
    icon: MapIcon,
    views: ['coach', 'practitioner']
  },
  {
    title: "Journeys V2 🚀",
    pageName: "JourneysV2",
    url: createPageUrl("JourneysV2"),
    icon: MapIcon,
    views: ['coach', 'practitioner']
  },
  {
    title: "My Journeys",
    pageName: "ClientJourneys",
    url: createPageUrl("ClientJourneys"),
    icon: MapIcon,
    views: ['client']
  },
  {
    title: "Tasks",
    pageName: "Tasks",
    url: createPageUrl("Tasks"),
    icon: CheckCircle,
    views: ['coach']
  },
  {
    title: "Tasks V2 🚀",
    pageName: "TasksV2",
    url: createPageUrl("TasksV2"),
    icon: CheckCircle,
    views: ['coach']
  },
  {
    title: "My Tasks",
    pageName: "ClientTasks",
    url: createPageUrl("ClientTasks"),
    icon: CheckCircle,
    views: ['client']
  },
  {
    title: "Approvals",
    pageName: "Approvals",
    url: createPageUrl("Approvals"),
    icon: ClipboardCheck,
    views: ['practitioner']
  },
  {
    title: "Payments",
    pageName: "Payments",
    url: createPageUrl("Payments"),
    icon: CreditCard,
    views: ['coach']
  },
  {
    title: "Payments V2 🚀",
    pageName: "PaymentsV2",
    url: createPageUrl("PaymentsV2"),
    icon: CreditCard,
    views: ['coach']
  },
  {
    title: "Notebook",
    pageName: "Notebook",
    url: createPageUrl("Notebook"),
    icon: NotebookPen,
    views: ['coach', 'practitioner', 'client']
  },
  {
    title: "Notebook V2 🚀",
    pageName: "NotebookV2",
    url: createPageUrl("NotebookV2"),
    icon: NotebookPen,
    views: ['coach', 'practitioner', 'client']
  },
  {
    title: "Chats",
    pageName: "Chats",
    url: createPageUrl("Chats"),
    icon: MessageCircle,
    views: ['coach', 'practitioner', 'client']
  },
  {
    title: "Practitioners",
    pageName: "Practitioners",
    url: createPageUrl("Practitioners"),
    icon: UserCheck,
    views: ['coach']
  },
  {
    title: "Practitioners V2 🚀",
    pageName: "PractitionersV2",
    url: createPageUrl("PractitionersV2"),
    icon: UserCheck,
    views: ['coach']
  },
  {
    title: "Knowledge Base",
    pageName: "KnowledgeBase",
    url: createPageUrl("KnowledgeBase"),
    icon: BookOpen,
    views: ['coach', 'practitioner']
  },
  {
    title: "Knowledge Base V2 🚀",
    pageName: "KnowledgeBaseV2",
    url: createPageUrl("KnowledgeBaseV2"),
    icon: BookOpen,
    views: ['coach', 'practitioner']
  },
  {
    title: "Files & Resources",
    pageName: "Files",
    url: createPageUrl("Files"),
    icon: Paperclip,
    views: ['coach', 'practitioner', 'client']
  },
  {
    title: "API Usage",
    pageName: "APIUsage",
    url: createPageUrl("APIUsage"),
    icon: BarChart3,
    views: ['coach']
  },
  {
    title: "Dashboard V3 (Zen) 🧘",
    pageName: "DashboardV3",
    url: createPageUrl("DashboardV3"),
    icon: LayoutDashboard,
    views: ['coach']
  },
  {
    title: "Dashboard V4 (Living) 🌊",
    pageName: "DashboardV4",
    url: createPageUrl("DashboardV4"),
    icon: LayoutDashboard,
    views: ['coach']
  },
  {
    title: "Dashboard V5 (Spatial) 🌌",
    pageName: "DashboardV5",
    url: createPageUrl("DashboardV5"),
    icon: LayoutDashboard,
    views: ['coach']
  },
  {
    title: "--- V3 PAGES ---",
    pageName: "divider-v3",
    url: "#",
    icon: MoreHorizontal,
    views: ['coach']
  },
  {
    title: "Clients V3",
    pageName: "ClientsV3",
    url: createPageUrl("ClientsV3"),
    icon: Users,
    views: ['coach', 'practitioner']
  },
  {
    title: "Sessions V3",
    pageName: "SessionsV3",
    url: createPageUrl("SessionsV3"),
    icon: Video,
    views: ['coach']
  },
  {
    title: "Journeys V3",
    pageName: "JourneysV3",
    url: createPageUrl("JourneysV3"),
    icon: MapIcon,
    views: ['coach', 'practitioner']
  },
  {
    title: "Tasks V3",
    pageName: "TasksV3",
    url: createPageUrl("TasksV3"),
    icon: CheckCircle,
    views: ['coach']
  },
  {
    title: "Notebook V3",
    pageName: "NotebookV3",
    url: createPageUrl("NotebookV3"),
    icon: NotebookPen,
    views: ['coach', 'practitioner']
  },
  {
    title: "Knowledge V3",
    pageName: "KnowledgeBaseV3",
    url: createPageUrl("KnowledgeBaseV3"),
    icon: BookOpen,
    views: ['coach', 'practitioner']
  },
  {
    title: "Payments V3",
    pageName: "PaymentsV3",
    url: createPageUrl("PaymentsV3"),
    icon: CreditCard,
    views: ['coach']
  },
  {
    title: "Practitioners V3",
    pageName: "PractitionersV3",
    url: createPageUrl("PractitionersV3"),
    icon: UserCheck,
    views: ['coach']
  },
];

function getNavigationItems() {
  const currentView = localStorage.getItem('currentView') || 'coach';
  return allNavigationItems.filter(item => item.views.includes(currentView));
}

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = React.useState(null);
  const [isNotesSliderOpen, setIsNotesSliderOpen] = useState(false);
  const [isKBSliderOpen, setIsKBSliderOpen] = useState(false);
  const [isTasksSliderOpen, setIsTasksSliderOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Ensure only one slider is open at a time
  const handleOpenNotesSlider = () => {
    setIsKBSliderOpen(false);
    setIsTasksSliderOpen(false);
    setIsNotesSliderOpen(true);
  };

  const handleOpenKBSlider = () => {
    setIsNotesSliderOpen(false);
    setIsTasksSliderOpen(false);
    setIsKBSliderOpen(true);
  };

  const handleOpenTasksSlider = () => {
    setIsNotesSliderOpen(false);
    setIsKBSliderOpen(false);
    setIsTasksSliderOpen(true);
  };

  // Handle Escape key to close sliders
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsNotesSliderOpen(false);
        setIsKBSliderOpen(false);
        setIsTasksSliderOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);
  const [navigationItems, setNavigationItems] = useState(getNavigationItems());

  // Listen for storage changes to update nav when view switches
  React.useEffect(() => {
    const handleStorageChange = () => {
      setNavigationItems(getNavigationItems());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for custom event to open notes slider
  React.useEffect(() => {
    const handleOpenNotesSliderEvent = () => {
      setIsKBSliderOpen(false);
      setIsNotesSliderOpen(true);
    };
    window.addEventListener('openNotesSlider', handleOpenNotesSliderEvent);
    return () => window.removeEventListener('openNotesSlider', handleOpenNotesSliderEvent);
  }, []);

  // Listen for custom event to edit a note
  React.useEffect(() => {
    const handleEditNoteEvent = () => {
      setIsKBSliderOpen(false);
      setIsNotesSliderOpen(true);
    };
    window.addEventListener('editNote', handleEditNoteEvent);
    return () => window.removeEventListener('editNote', handleEditNoteEvent);
  }, []);

  React.useEffect(() => {
    // Mock user loading
    setUser(CURRENT_USER);
  }, []);

  // Calculate unread count from mock data
  React.useEffect(() => {
    if (!user) return;

    // Calculate unread messages from mock chats
    const myConversations = CHATS.filter(
      c => c.participant1 === user.email || c.participant2 === user.email
    );

    const count = myConversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
    setUnreadCount(count);
  }, [user]);

  const handleLogout = () => {
    // base44.auth.logout();
    console.log("Mock logout");
    window.location.reload();
  };

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary: 142 76% 36%;
          --primary-foreground: 0 0% 100%;
          --secondary: 142 30% 96%;
          --accent: 142 50% 88%;
        }
      `}</style>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Sidebar className="border-r border-emerald-100 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-emerald-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">HealthCoach</h2>
                <p className="text-xs text-emerald-600">Client Management</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Main Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 rounded-xl mb-1 ${currentPageName === item.pageName ? 'bg-emerald-50 text-emerald-700 shadow-sm' : ''
                          }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                          {item.pageName === 'Chats' && unreadCount > 0 && (
                            <span className="ml-auto bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shadow-md animate-pulse">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-emerald-100 p-4">
            {user && (
              <>
                <div className="flex items-center gap-3 mb-3 px-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.full_name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{user.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          {/* Desktop Header with View Switcher */}
          <header className="hidden md:flex bg-white/60 backdrop-blur-md border-b border-emerald-100 px-6 py-3 sticky top-0 z-10 items-center justify-end">
            <ViewSwitcher />
          </header>

          {/* Mobile Header */}
          <header className="bg-white/60 backdrop-blur-md border-b border-emerald-100 px-6 py-4 md:hidden sticky top-0 z-10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-emerald-50 p-2 rounded-lg transition-colors duration-200" />
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-emerald-600" />
                  <h1 className="text-lg font-bold text-gray-900">HealthCoach</h1>
                </div>
              </div>
              <ViewSwitcher />
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>

        {/* Floating Notes Button */}
        <FloatingNotesButton onClick={handleOpenNotesSlider} />

        {/* Notes Slider */}
        <NotesSlider
          isOpen={isNotesSliderOpen}
          onClose={() => setIsNotesSliderOpen(false)}
          currentPageName={currentPageName}
        />

        {/* Floating KB Button */}
        <FloatingKBButton
          onClick={() => {
            handleOpenKBSlider();
            window.dispatchEvent(new CustomEvent('openKBSlider'));
          }}
          articleCount={0}
        />

        {/* Knowledge Base Slider */}
        <KnowledgeBaseSlider
          isOpen={isKBSliderOpen}
          onClose={() => setIsKBSliderOpen(false)}
          currentPageName={currentPageName}
        />

        {/* Floating Tasks Button */}
        <FloatingTasksButton
          onClick={handleOpenTasksSlider}
          taskCount={0}
        />

        {/* Tasks Slider */}
        <TasksSlider
          isOpen={isTasksSliderOpen}
          onClose={() => setIsTasksSliderOpen(false)}
          currentPageName={currentPageName}
        />

        {/* Chat Widget */}
        <ChatWidget />
      </div>
    </SidebarProvider>
  );
}
