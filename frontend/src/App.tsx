import { Route, Routes } from "react-router-dom";
import VerifyInvitePage from "./pages/VerifyInvitePage.tsx";
import RegistrationPage from "./pages/RegistrationPage.tsx";
// import TestPage from "./pages/TestPage.tsx"; 
import PersonalInfoPage from "./pages/PersonalInfoPage.tsx";
import VisaStatusPage   from './pages/VisaStatusPage';


function App() {
    return (
        <div>
            <Routes>
                <Route path="/WelecomeToChuwa/:inviteToken" element={ <VerifyInvitePage/> }/>
                <Route path="/register/*" element={ <RegistrationPage/> }/>
                <Route path="/profile" element={<PersonalInfoPage/>}/>
                <Route path="/employee/visa-status" element={<VisaStatusPage />} />
                
            </Routes>
        </div>

    )
}

export default App