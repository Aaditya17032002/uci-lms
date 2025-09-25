"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { Calendar } from 'lucide-react'
import { AddLeaveForm } from "../../modules/add-view leaves/add-leave-form"
import { ViewLeaveHistory } from "../../modules/add-view leaves/view-leave-history"

interface AddViewLeavesPageProps {
  isDarkMode?: boolean
  sidebarOpen?: boolean
}

export default function AddViewLeavesPage({ isDarkMode, sidebarOpen }: AddViewLeavesPageProps) {
  const [activeTab, setActiveTab] = useState("add-leave")

  return (
  <div className={`p-6 space-y-6 ${isDarkMode ? 'text-white bg-gray-900' : 'text-gray-900 bg-gray-50'} ${!sidebarOpen ? 'max-w-none' : 'max-w-7xl mx-auto'}`}>
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm">
        <CardHeader className="border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6">
          <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            Add/View Leaves
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="add-leave" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none bg-gray-50 dark:bg-gray-700 h-12">
              <TabsTrigger
                value="add-leave"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 text-gray-600 dark:text-gray-300 font-medium"
              >
                Add Leave
              </TabsTrigger>
              <TabsTrigger
                value="view-history"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 text-gray-600 dark:text-gray-300 font-medium"
              >
                View Leave History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="add-leave" className="mt-6">
              <AddLeaveForm />
            </TabsContent>
            <TabsContent value="view-history" className="mt-6">
              <ViewLeaveHistory />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
