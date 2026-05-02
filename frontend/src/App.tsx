import { Navigate, Route, Routes } from "react-router-dom";

import VerifyInvitePage from "./pages/VerifyInvitePage";
import RegistrationPage from "./pages/RegistrationPage";
import SignInPage from "./pages/SignInPage";
import MyApplicationPage from "./pages/MyApplicationPage";
import PersonalInfoPage from "./pages/PersonalInfoPage";
import VisaStatusPage from "./pages/VisaStatusPage";

import HRApplicationsPage from "./pages/HRApplicationsPage";
import HREmployeeProfileDetailPage from "./pages/HREmployeeProfileDetailPage";
import HREmployeeProfilesPage from "./pages/HREmployeeProfilesPage";
import HRVisaStatusDetailPage from "./pages/HRVisaStatusDetailPage";
import HRVisaStatusPage from "./pages/HRVisaStatusPage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/signin" replace />;
  return <>{children}</>;
};

function App() {
    return (
        <div>
            <Routes>
                {/*Auth*/}
                <Route path="/WelcomeToChuwa/:inviteToken" element={ <VerifyInvitePage/> }/>
                <Route path="/register/:inviteToken" element={ <RegistrationPage/> }/>
                <Route path="/signin" element={ <SignInPage/> }/>
                <Route path="/application" element={ <MyApplicationPage/> }/>

                {/* Employee */}
                <Route path="/employee/profile" element={
                <ProtectedRoute><PersonalInfoPage/></ProtectedRoute>
                }/>
                <Route path="/employee/visa-status" element={
                <ProtectedRoute><VisaStatusPage/></ProtectedRoute>
                }/>
                <Route path='*' element={ <Navigate to="/signin" /> }/>
              
                {/* HR */}
                <Route path="/" element={<Navigate to="/signin" replace />} />
                <Route path="/hr" element={<Navigate to="/hr/onboarding" replace />} />
                <Route path="/hr/onboarding" element={<HRApplicationsPage />} />
                <Route path="/hr/employees" element={<HREmployeeProfilesPage />} />
                <Route path="/hr/employees/:id" element={<HREmployeeProfileDetailPage />} />
                <Route path="/hr/visa" element={<HRVisaStatusPage />} />
                <Route path="/hr/visa/:id" element={<HRVisaStatusDetailPage />} />

            </Routes>
        </div>
    )
}

export default App;