import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function TasksV2() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Tasks V2</h1>
            </div>
            <p className="text-gray-600 ml-15">New redesigned task management interface</p>
          </div>
        </div>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Start Building Your New Tasks View</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              This is your new Tasks V2 page. Your original Tasks page remains fully functional.
            </p>
            <p className="text-gray-500 text-sm">
              You can now build out the exact functionality and design you want here without affecting the existing page.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}