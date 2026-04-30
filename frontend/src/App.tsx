// placeHolder, tailwindcss
import { Route, Routes } from "react-router-dom";
import VerifyInvitePage from "./pages/VerifyInvitePage.tsx";
import RegistrationPage from "./pages/RegistrationPage.tsx";

function App() {
    return (
        <div>
            <Routes>
                <Route path="/WelecomeToChuwa/:inviteToken" element={ <VerifyInvitePage/> }/>
                <Route path="/register/*" element={ <RegistrationPage/> }/>
            </Routes>
        </div>

    )
}

export default App