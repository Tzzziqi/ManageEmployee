// Trigger data fetching-Manage loading state-Compose all Sections
// orchestrator: composes 6 Sections - All data logic lives in individual Sections and profileSlice
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../store/slices/profileSlice';
import type { RootState, AppDispatch } from '../store/store';
import Navbar from '../components/Navbar';
import NameSection         from '../components/employee/sections/NameSection';
import AddressSection      from '../components/employee/sections/AddressSection';
import ContactSection      from '../components/employee/sections/ContactSection';
import EmploymentSection   from '../components/employee/sections/EmploymentSection';
import EmergencySection    from '../components/employee/sections/EmergencySection';
import DocumentsSection    from '../components/employee/sections/DocumentsSection';
import { Toaster } from 'react-hot-toast';

const PersonalInfoPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { data, loading } = useSelector((s: RootState) => s.profile);
    // === 1:Fetch user profile data when the page mounts===
    useEffect(() => {dispatch(fetchProfile());
    // empty deps, coz u only need fetch the profile once and then through extreReducers locally update the store
    },[]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <p className="text-gray-500">Loading...</p>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
        <Navbar />
        <Toaster position="top-right" />
        <main className="flex-1 p-8 max-w-3xl"> 

        {/* ── Profile Header ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700">
                {data?.firstName?.[0]}{data?.lastName?.[0]}
            </div>
            
            <div>
                <p className="font-semibold text-gray-800">
                    {data?.firstName} {data?.lastName} </p>
                <p className="text-sm text-gray-500">
                    {data?.email} · {data?.visaType || data?.residentType} </p>
            </div>

            {/*Onborading State Badge */}
            <span className="ml-auto text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200">
                Onboarding approved
            </span>
        </div>

        {/*6 section, */}
        <NameSection />
        <AddressSection />
        <ContactSection />
        <EmploymentSection />
        <EmergencySection />
        <DocumentsSection />
                
        </main>
        </div>
    );
};
export default PersonalInfoPage;
