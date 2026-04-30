import { Navigate, Route, Routes } from "react-router-dom";
import VerifyInvitePage from "./pages/VerifyInvitePage.tsx";
import RegistrationPage from "./pages/RegistrationPage.tsx";
import HRApplicationsPage from "./pages/HRApplicationsPage.tsx";

function App() {
    return (
        <div>
            <Routes>
                <Route path="/WelcomeToChuwa/:inviteToken" element={ <VerifyInvitePage/> }/>
                <Route path="/register/:inviteToken" element={ <RegistrationPage/> }/>
                <Route path="/hr/applications" element={<HRApplicationsPage />} />
                <Route path="/" element={<Navigate to="/hr/applications" replace />} />
            </Routes>
        </div>

    )
}

export default App