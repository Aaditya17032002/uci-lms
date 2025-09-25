
// == responsive ==


"use client"

import { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"

import { LeavePoliciesPage } from "./leave-policies"

import { LeaveTypesDirectoryPage } from "./leave-types-directory"

import { UserPolicyMappingPage } from "./user-policy-mapping"

import { LeaveSummaryPage } from "./leave-summary"

import { LeaveRequestApprovalsPage } from "./leave-request-approvals"

import { Briefcase } from "lucide-react" // Using Briefcase as a generic icon for Leave Management

export function LeaveManagementPage() {

  const [activeTab, setActiveTab] = useState("leave-policies")

  return (
    <div className="p-4 sm:p-6 space-y-6">
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm">
      <CardHeader className="border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6">
        <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-blue-600" />

          Leave Management
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          {/* TabsList made scrollable on mobile */}

          <div className="w-full overflow-x-auto">
            <TabsList className=" flex h-12 border-b-0 whitespace-nowrap md:min-w-full">
              <TabsTrigger

                value="leave-policies"

                className="rounded-t-lg border-b-2 border-transparent 

      data-[state=active]:border-blue-500 data-[state=active]:bg-white 

      dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 

      dark:data-[state=active]:text-gray-100 text-gray-600 dark:text-gray-300 

      font-medium px-4 py-2 transition-colors duration-200"
              >

                Leave Policies
              </TabsTrigger>
              <TabsTrigger

                value="leave-types"

                className="rounded-t-lg border-b-2 border-transparent 

      data-[state=active]:border-blue-500 data-[state=active]:bg-white 

      dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 

      dark:data-[state=active]:text-gray-100 text-gray-600 dark:text-gray-300 

      font-medium px-4 py-2 transition-colors duration-200"
              >

                Leave Types
              </TabsTrigger>
              <TabsTrigger value="user-policy-mapping" className="rounded-t-lg border-b-2 border-transparent 

      data-[state=active]:border-blue-500 data-[state=active]:bg-white 

      dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 

      dark:data-[state=active]:text-gray-100 text-gray-600 dark:text-gray-300 

      font-medium px-4 py-2 transition-colors duration-200">

                User-Policy Mapping
              </TabsTrigger>
              <TabsTrigger value="leave-summary" className="rounded-t-lg border-b-2 border-transparent 

      data-[state=active]:border-blue-500 data-[state=active]:bg-white 

      dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 

      dark:data-[state=active]:text-gray-100 text-gray-600 dark:text-gray-300 

      font-medium px-4 py-2 transition-colors duration-200">

                Leave Summary
              </TabsTrigger>
              <TabsTrigger value="leave-request-approvals" className="rounded-t-lg border-b-2 border-transparent 

      data-[state=active]:border-blue-500 data-[state=active]:bg-white 

      dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 

      dark:data-[state=active]:text-gray-100 text-gray-600 dark:text-gray-300 

      font-medium px-4 py-2 transition-colors duration-200">

                Leave Request Approvals
              </TabsTrigger>
            </TabsList>
          </div>


          {/* Tabs Content */}
          <TabsContent value="leave-policies" className="p-6">
            <LeavePoliciesPage />
          </TabsContent>
          <TabsContent value="leave-types" className="p-6">
            <LeaveTypesDirectoryPage />
          </TabsContent>
          <TabsContent value="user-policy-mapping" className="p-6">
            <UserPolicyMappingPage />
          </TabsContent>
          <TabsContent value="leave-summary" className="p-6">
            <LeaveSummaryPage />
          </TabsContent>
          <TabsContent value="leave-request-approvals" className="p-6">
            <LeaveRequestApprovalsPage />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
</div>
  )

}

