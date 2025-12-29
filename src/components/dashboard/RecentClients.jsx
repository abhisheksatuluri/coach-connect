import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { motion } from "framer-motion";

const statusColors = {
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
  prospect: "bg-blue-100 text-blue-800 border-blue-200",
};

export default function RecentClients({ clients }) {
  const recentClients = clients.slice(0, 5);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Users className="w-5 h-5 text-emerald-600" />
          Recent Clients
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {recentClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors duration-200"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                <span className="text-white font-semibold text-sm">
                  {(client.name || client.full_name || "?")[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{client.name || client.full_name}</p>
                <p className="text-sm text-gray-500 truncate">{client.email}</p>
              </div>
              <Badge variant="outline" className={statusColors[client.status]}>
                {client.status}
              </Badge>
            </motion.div>
          ))}
          {recentClients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No clients yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}