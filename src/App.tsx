import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { Sidebar } from "./layout/sidebar";

import { Header } from "./layout/header";

import { Footer } from "./layout/footer";

// Import Pages

import Dashboard from "./pages/page";
import LoginPage from "./pages/login";
import Timesheet from "./pages/timesheet/page";

import AddViewLeaves from "./pages/add-view-leaves/page";

import AssignApprover from "./pages/assign-approver/page";

import LeaveManagement from "./pages/leave-management/page";

import PendingApprovals from "./pages/pending-approvals/page";

import ManageEngagements from "./pages/manage-engagements/page";

import Reports from "./pages/reports/page";  // or wherever your reports live
import ClientLayout from "./pages/client-layout";

function App() {

  return (
    <Router>
      <ClientLayout>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/timesheet" element={<Timesheet />} />
          <Route path="/add-view-leaves" element={<AddViewLeaves />} />
          <Route path="/assign-approver" element={<AssignApprover />} />
          <Route path="/leave-management" element={<LeaveManagement />} />
          <Route path="/pending-approvals" element={<PendingApprovals />} />
          <Route path="/manage-engagements" element={<ManageEngagements />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>

        {/* Footer */}
        {/* <Footer /> */}
      </ClientLayout>
    </Router>

  );

}

export default App;

