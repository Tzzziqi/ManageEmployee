//==OPT Visa Document Status Management Page
// ==Fetch visa status, Determine if the user is an OPT employee, Render 4 file upload steps in order
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import Navbar from '../components/Navbar';
import DocumentCard from '../components/employee/DocumentCard';
import { Toaster } from 'react-hot-toast';
import { fetchVisaStatus } from '@/store/slices/visaSlice';

const isUploadableStatus = (status?: string | null) =>
    !status || ['not_uploaded', 'not_started', 'rejected'].includes(status);

const VisaStatusPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {data, loading, error } = useSelector((s: RootState) => s.visa);
    
    useEffect(() => {
        dispatch(fetchVisaStatus());
    },[]);

    // useEffect(() => {
    //     const refreshVisaStatus = () => {
    //         dispatch(fetchVisaStatus());
    //     };

    //     const intervalId = window.setInterval(refreshVisaStatus, 30000);
    //     window.addEventListener('focus', refreshVisaStatus);

    //     return () => {
    //         window.clearInterval(intervalId);
    //         window.removeEventListener('focus', refreshVisaStatus);
    //     };
    // }, [dispatch]);

    if(loading) return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    );

    if(error) return (
        <div className="flex min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-1 p-8">
                <p className="text-sm text-red-600">{error}</p>
            </main>
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
                canUpload={isUploadableStatus(visaData?.OPT_RECEIPT?.status)}/>
                
                <DocumentCard lable="OPT EAD" doc={visaData?.OPT_EAD} docType="OPT_EAD"
                canUpload={visaData?.OPT_RECEIPT?.status === 'approved' && isUploadableStatus(visaData?.OPT_EAD?.status)}/>

                <DocumentCard lable="I-983" doc={visaData?.I_983} docType="I_983"
                canUpload={visaData?.OPT_EAD?.status === 'approved' && isUploadableStatus(visaData?.I_983?.status)}
                showTemplates={true} />
            
                <DocumentCard lable="I-20" doc={visaData?.I_20} docType="I_20"
                canUpload={visaData?.I_983?.status === 'approved' && isUploadableStatus(visaData?.I_20?.status)}/>

        </main>
    </div>
  );
};
export default VisaStatusPage;

                
