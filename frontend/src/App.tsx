import { Navigate, Route, Routes } from "react-router-dom";
import HRApplicationsPage from "./pages/HRApplicationsPage";
import HREmployeeProfileDetailPage from "./pages/HREmployeeProfileDetailPage";
import HREmployeeProfilesPage from "./pages/HREmployeeProfilesPage";
import HRVisaStatusDetailPage from "./pages/HRVisaStatusDetailPage";
import HRVisaStatusPage from "./pages/HRVisaStatusPage";
import RegistrationPage from "./pages/RegistrationPage";
import VerifyInvitePage from "./pages/VerifyInvitePage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/hr/onboarding" replace />} />
      <Route path="/hr" element={<Navigate to="/hr/onboarding" replace />} />

      <Route path="/hr/onboarding" element={<HRApplicationsPage />} />
      <Route path="/hr/employees" element={<HREmployeeProfilesPage />} />
      <Route path="/hr/employees/:id" element={<HREmployeeProfileDetailPage />} />
      <Route path="/hr/visa" element={<HRVisaStatusPage />} />
      <Route path="/hr/visa/:id" element={<HRVisaStatusDetailPage />} />

      <Route path="/verify/:inviteToken" element={<VerifyInvitePage />} />
      <Route path="/register/:inviteToken" element={<RegistrationPage />} />

      <Route path="*" element={<Navigate to="/hr/onboarding" replace />} />
    </Routes>
  );
};

export default App;
