//==OPT Visa Document Status Management Page
// ==Fetch visa status, Determine if the user is an OPT employee, Render 4 file upload steps in order
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import Navbar from '../components/Navbar';
import DocumentCard from '../components/employee/DocumentCard';
import { Toaster } from 'react-hot-toast';
import { fetchVisaStatus } from '@/store/slices/visaSlice';

const VisaStatusPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {data, loading } = useSelector((s: RootState) => s.visa);
    
    useEffect(() => {
        dispatch(fetchVisaStatus());
    },[]);

    useEffect(() => {
        const refreshVisaStatus = () => {
            dispatch(fetchVisaStatus());
        };

        const intervalId = window.setInterval(refreshVisaStatus, 30000);
        window.addEventListener('focus', refreshVisaStatus);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener('focus', refreshVisaStatus);
        };
    }, [dispatch]);

    if(loading) return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    );

    if (data && !data.isOPT) return (
        <div className="flex min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-1 p-8">
            <p className="text-gray-500 text-sm">
            Visa Status Management is only available for OPT employees.
            </p>
        </main>
        </div>
  );
    const visaData = data;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Navbar />
            <Toaster position="top-right" />
            <main className="flex-1 p-8 max-w-2xl">
            
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                    Visa Status Management </h1>
                    <p className="text-sm text-gray-500 mb-6">
                    Upload documents in order. Each step will unlock after HR approves the previous one.
                    </p>
                 {/* 1: first needed uploaed file: optrecepit── */}
                <DocumentCard lable="OPT Receipt" doc={visaData?.OPT_RECEIPT} docType="OPT_RECEIPT"
                canUpload={!visaData?.OPT_RECEIPT || visaData?.OPT_RECEIPT?.status === 'rejected'}/>
                
                <DocumentCard lable="OPT EAD" doc={visaData?.OPT_EAD} docType="OPT_EAD"
                canUpload={visaData?.OPT_RECEIPT?.status === 'approved' && (!visaData?.OPT_EAD || visaData?.OPT_EAD?.status === 'rejected')}/>

                <DocumentCard lable="I-983" doc={visaData?.I_983} docType="I_983"
                canUpload={visaData?.OPT_EAD?.status === 'approved' && (!visaData?.I_983 || visaData?.I_983?.status === 'rejected')}
                showTemplates={true} />
            
                <DocumentCard lable="I-20" doc={visaData?.I_20} docType="I_20"
                canUpload={visaData?.I_983?.status === 'approved' && (!visaData?.I_20 || visaData?.I_20?.status === 'rejected')}/>

        </main>
    </div>
  );
};
export default VisaStatusPage;

                
