import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import DocumentManagement from './pages/admin/DocumentManagement';
import HRChatbot from './pages/admin/HRChatbot';
import PolicyGap from './pages/admin/PolicyGap';
import Employees from './pages/admin/Employees';
import AdminProfile from './pages/admin/AdminProfile';
import AdminFeedback from './pages/admin/AdminFeedback';
import HallucinationGuard from './pages/admin/HallucinationGuard';

// Employee Pages
import EmployeeLayout from './pages/employee/EmployeeLayout';
import EmployeeHome from './pages/employee/EmployeeHome';
import EmployeeChatbot from './pages/employee/EmployeeChatbot';
import EmployeeAlerts from './pages/employee/EmployeeAlerts';
import EmployeeSettings from './pages/employee/EmployeeSettings';
import EmployeeFeedback from './pages/employee/EmployeeFeedback';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="documents" element={<DocumentManagement />} />
          <Route path="chatbot" element={<HRChatbot />} />
          <Route path="policy-gap" element={<PolicyGap />} />
          <Route path="employees" element={<Employees />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="hallucination-guard" element={<HallucinationGuard />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route index element={<Navigate to="/admin/dashboard" />} />
        </Route>

        {/* Employee Routes */}
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route path="home" element={<EmployeeHome />} />
          <Route path="chatbot" element={<EmployeeChatbot />} />
          <Route path="alerts" element={<EmployeeAlerts />} />
          <Route path="settings" element={<EmployeeSettings />} />
          <Route path="feedback" element={<EmployeeFeedback />} />
          <Route index element={<Navigate to="/employee/home" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;



