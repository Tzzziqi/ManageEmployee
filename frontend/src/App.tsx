import { Navigate, Route, Routes } from "react-router-dom";
import VerifyInvitePage from "./pages/VerifyInvitePage.tsx";
import RegistrationPage from "./pages/RegistrationPage.tsx";
import SignInPage from "./pages/SignInPage.tsx";
import MyApplicationPage from "./pages/MyApplicationPage.tsx";
// import TestPage from "./pages/TestPage.tsx";
import PersonalInfoPage from "./pages/PersonalInfoPage.tsx";
import VisaStatusPage   from './pages/VisaStatusPage';


function App() {
    return (
        <div>
            <Routes>
                <Route path="/WelcomeToChuwa/:inviteToken" element={ <VerifyInvitePage/> }/>
                <Route path="/register/:inviteToken" element={ <RegistrationPage/> }/>
                <Route path="/signin" element={ <SignInPage/> }/>
                <Route path="/application" element={ <MyApplicationPage/> }/>
                <Route path="/profile" element={<PersonalInfoPage/>}/>
                <Route path="/employee/visa-status" element={<VisaStatusPage />} />
                <Route path='*' element={ <Navigate to="/signin" /> }/>
            </Routes>
        </div>
    )
}

export default App