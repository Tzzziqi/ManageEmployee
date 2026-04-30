import { useNavigate, useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../store/store.ts";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { resetInvite, validateInvite } from "../store/slices/inviteSlice.ts";
import { Spin, Result, message } from 'antd';

const VerifyInvitePage = () => {
    const { inviteToken } = useParams<{ inviteToken: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { isVerified, status, error } = useSelector((state: RootState) => state.invite);

    useEffect(() => {
        if (inviteToken) {
            dispatch(validateInvite(inviteToken));
        } else {
            message.error('Invalid link parameters.');
        }

        return () => {
            dispatch(resetInvite());
        };
    }, [inviteToken, dispatch]);

    useEffect(() => {
        if (status === 'succeeded' && isVerified) {
            message.success('Verification successful! Redirecting...');
            const timer = setTimeout(() => {
                navigate(`/register/${inviteToken}`);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [status, isVerified, navigate, dispatch]);

    if (status === 'loading') {
        return (
            <div style={{ textAlign: 'center', marginTop: 100 }}>
                <Spin size="large" tip="Verifying invitation link..." />
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <Result
                status="error"
                title="Verification Failed"
                subTitle={error || 'This invitation link is invalid or has expired.'}
            />
        );
    }

    if (status === 'succeeded') {
        return (
            <Result
                status="success"
                title="Verification Successful!"
                subTitle="Welcome to Chuwa! You will be redirected to the sign-up page in 3 seconds."
            />
        );
    }

    return null;
};

export default VerifyInvitePage;