import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getApplication } from "../store/slices/applicationSlice.ts";
import MyStepForm from "../forms/MyStepForm.tsx";
import type { AppDispatch } from "../store/store.ts";
import type { applicationRequest } from "../services/applicationService.ts";

const ApplicationPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [appData, setAppData] = useState<applicationRequest | null>(null);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const checkApplicationStatus = async () => {
            try {
                const response = await dispatch(getApplication()).unwrap();
                if (response && response.status === 'approved') {
                    navigate('/home', { replace: true });
                } else {
                    setAppData(response);
                }
            } catch {
                setAppData(null);
            } finally {
                setLoading(false);
            }
        };
        checkApplicationStatus();
    }, [navigate, dispatch]);

    if (loading) return null;

    return (
        <div style={{
            backgroundColor: '#f4eee8',
            minHeight: '100vh',
            padding: '60px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>

            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <h1 style={{ color: '#a67c52', fontSize: '28px', fontWeight: 600 }}>
                    {appData?.status === 'rejected' ? 'Re-submit Application' : 'Submit Application'}
                </h1>
                <p style={{ color: '#8c8c8c' }}>Please ensure the information you provide matches your ID</p>
            </div>

            <div style={{ width: '100%', maxWidth: 900 }}>
                <MyStepForm initialValues={appData?.applicationData} />
            </div>
        </div>
    );
};

export default ApplicationPage;