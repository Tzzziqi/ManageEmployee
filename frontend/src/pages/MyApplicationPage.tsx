import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getApplication } from "../store/slices/applicationSlice.ts";
import MyStepForm from "../forms/MyStepForm.tsx";
import type { AppDispatch } from "../store/store.ts";
import type { applicationRequest } from "../services/applicationService.ts";

// 1. 導入 logout action 和 Ant Design 組件
import { logout } from "../store/slices/authSlice.ts";
import { Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";

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

    // 2. 處理登出邏輯
    const handleLogout = () => {
        dispatch(logout());
        navigate('/signin');
    };

    const getHeaderInfo = () => {
        const status = appData?.status;

        if (status === 'rejected') {
            return {
                title: 'Re-submit Application',
                subtitle: appData?.feedback || 'Your application was not approved. Please check and re-submit.',
                subtitleColor: '#ff4d4f'
            };
        }

        if (status === 'pending') {
            return {
                title: 'Pending for Review',
                subtitle: 'Please wait for approval.',
                subtitleColor: '#faad14'
            };
        }

        return {
            title: 'Submit Application',
            subtitle: 'Please ensure the information you provide matches your ID',
            subtitleColor: '#8c8c8c'
        };
    };

    const { title, subtitle, subtitleColor } = getHeaderInfo();

    if (loading) return <div style={{ textAlign: 'center', marginTop: 100 }}>Loading...</div>;

    return (
        <div style={{
            backgroundColor: '#f4eee8',
            minHeight: '100vh',
            padding: '60px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative' // 為了讓登出按鈕定位
        }}>

            {/* 3. 登出按鈕放置在右上角 */}
            <div style={{ position: 'absolute', top: 20, right: 30 }}>
                <Button
                    type="text"
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    style={{
                        color: '#a67c52',
                        fontWeight: 500,
                        fontSize: '16px'
                    }}
                >
                    Logout
                </Button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <h1 style={{ color: '#a67c52', fontSize: '28px', fontWeight: 600 }}>
                    {title}
                </h1>
                <p style={{ color: subtitleColor, fontSize: '16px' }}>
                    {subtitle}
                </p>
            </div>

            <div style={{ width: '100%', maxWidth: 900 }}>
                <MyStepForm
                    key={appData?.status || 'new'}
                    initialValues={appData}
                    isReadOnly={appData?.status === 'pending'}
                    status={appData?.status || ''}
                />
            </div>
        </div>
    );
};

export default ApplicationPage;
