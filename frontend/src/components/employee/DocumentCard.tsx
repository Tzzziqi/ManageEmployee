// Display file status + upload button + status hint text + HR feedback
// Called 4 times by VisaStatusPage: OPT Receipt → OPT EAD → I-983 → I-20
import { useDispatch, useSelector } from 'react-redux';
// import { useRef } from 'react';
import { uploadDocument, fetchVisaStatus } from '@/store/slices/visaSlice';
import type { RootState, AppDispatch } from '../../store/store';
import toast from 'react-hot-toast';

interface Props {
    lable:string; doc: any; docType: string; canUpload: boolean; showTemplates?: boolean;
}
const getCardStyle = (status: string | null) => {
    const map: any = {
        approved: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800' },
        pending:  { bg: 'bg-blue-50',  border: 'border-blue-200',  badge: 'bg-blue-100 text-blue-800'  },
        rejected: { bg: 'bg-red-50',   border: 'border-red-200',   badge: 'bg-red-100 text-red-800'   },
        null:     { bg: 'bg-gray-50',  border: 'border-gray-200',  badge: 'bg-gray-100 text-gray-500' },
    };
    return map[status || 'null'] || map['null'];
};

const pendingMessages: any = {
    OPT_RECEIPT: 'Waiting for HR to approve your OPT Receipt.',
    OPT_EAD:     'Waiting for HR to approve your OPT EAD.',
    I_983:       'Waiting for HR to approve and sign your I-983.',
    I_20:        'Waiting for HR to approve your I-20.',
    };
const approvedMessages: any = {
    OPT_RECEIPT: 'Please upload a copy of your OPT EAD.',
    OPT_EAD:     'Please download and fill out the I-983 form.',
    I_983:       'Please send the I-983 along with all necessary documents to your school and upload the new I-20.',
    I_20:        'All documents have been approved.',
    };
    


const DocumentCard = ({ lable, doc, docType, canUpload, showTemplates }: Props) => {
    const dispatch  = useDispatch<AppDispatch>();
    const uploading = useSelector((s: RootState) => s.visa.uploading);
    // const fileInputRef = useRef<HTMLInputElement>(null);
    const style = getCardStyle(doc?.status || null);
    // console.log(`[${docType}] canUpload:`, canUpload, 'doc?.status:', doc?.status); 


    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        console.log('handleUpload triggered, file:', file);
        if (!file) return;
        try{
            await dispatch(uploadDocument({ file, docType })).unwrap();
            toast.success('Uploaded! Waiting for HR approval.');
            dispatch(fetchVisaStatus());
        } catch (error) {
            toast.error(String(error || 'Upload failed. Please try again.'));
    }
    e.target.value = '';
};
    // --- render 
    return (
        <div className={`${style.bg} border ${style.border} rounded-xl p-5 mb-3`}>
            {/* ── Title row: File name + status badge ── */}
            <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-gray-800 text-sm">{lable}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${style.badge}`}>
                {doc?.status
                    ? doc.status.charAt(0).toUpperCase() + doc.status.slice(1)
                    : 'Locked'} 
                </span>
            </div>
            {doc?.status === 'pending' && (
                <p className="text-sm text-blue-700 mb-2">{pendingMessages[docType]}</p>
            )}
            {doc?.status === 'approved' && (
                <p className="text-sm text-green-700 mb-2">{approvedMessages[docType]}</p>
            )}
            {!doc && (
                <p className="text-sm text-gray-400">
                {canUpload ? 'Ready to upload.' : 'Locked — previous step not approved.'}
                </p>
            )}

            {doc?.status === 'rejected' && (
            <div className="mt-2 p-3 bg-red-100 rounded-lg">
                <p className="text-xs text-red-700 font-semibold mb-1">HR Feedback:</p>
                <p className="text-sm text-red-700">{doc.feedback || 'No feedback provided.'}</p>
            </div>
        )}

            {showTemplates && (
            <div className="flex gap-3 mt-2 mb-2">
                <a href="/templates/i983-empty.pdf" download className="text-xs text-blue-600 hover:underline">
                    Download Empty Template
                </a>
                <a href="/templates/i983-sample.pdf" download className="text-xs text-blue-600 hover:underline">
                Download Sample Template </a>
             </div>
            )}

            {canUpload && (
                <>
                    <label
                        htmlFor={`file-upload-${docType}`}
                        className={`mt-2 inline-block cursor-pointer px-4 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {uploading ? 'Uploading...' : `Upload ${lable}`}
                    </label>
                    <input
                        id={`file-upload-${docType}`}
                        type="file"
                        accept=".pdf,.jpg,.png"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </>
            )}
           

            {/*  Uploaded file preview and download (shown when fileUrl exists) */}
            {doc?.fileUrl && (
                <div className="flex gap-4 mt-2">
                <button
                    onClick={() => window.open(doc.fileUrl, '_blank')}
                    className="text-xs text-blue-600 hover:underline">
                    Preview
                </button>
                <a href={doc.fileUrl} download
                    className="text-xs text-blue-600 hover:underline">
                    Download
                </a>
                </div>
            )}
            </div>
        );
};


export default DocumentCard;
