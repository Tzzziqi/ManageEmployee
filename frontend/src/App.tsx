import { Navigate, Route, Routes } from "react-router-dom";
import VerifyInvitePage from "./pages/VerifyInvitePage.tsx";
import RegistrationPage from "./pages/RegistrationPage.tsx";
import HRApplicationsPage from "./pages/HRApplicationsPage.tsx";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <div>
            <Routes>
                <Route path="/WelcomeToChuwa/:inviteToken" element={ <VerifyInvitePage/> }/>
                <Route path="/register/:inviteToken" element={ <RegistrationPage/> }/>
                <Route
                    path="/hr/onboarding"
                    element={
                        <ProtectedRoute allowedRole="hr">
                        <HRApplicationsPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/" element={<Navigate to="/hr/onboarding" replace />} />
            </Routes>
        </div>
    )
}

export default App