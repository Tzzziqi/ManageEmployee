// DocumentsSection  component: display/Read only, data come from data.documents(need bk getProfile return together
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import SectionCard from '../SectionCard';

const DocumentsSection = () => {
  const data = useSelector((s: RootState) => s.profile.data);
  const documents = data?.documents ?? []; // empty array for null/undefdined case

  const docList = [
    { label: "Driver's License", type: 'DRIVERS_LICENSE' },
    { label: 'Work Authorization', type: 'WORK_AUTH' },
    { label: 'OPT Receipt',        type: 'OPT_RECEIPT'  },
    { label: 'OPT EAD',            type: 'OPT_EAD'      },
    { label: 'I-983',              type: 'I_983'         },
    { label: 'I-20',               type: 'I_20'          },
  ];
  // only show uploded files. Filter + some logic
  const uploadedDocs = docList.filter(d => documents.some((doc: any) => doc.type === d.type)
  );
  
  return (
    <SectionCard
      title="Documents" readOnly={true}
      onSave={async () => {}} //empty coz dont need it, readyonly model
      onDiscard={() => {}} >
    {/*{() => (...)}  coz under readOnly we dont need isEditing*/}
      {() => (
        <div className="flex flex-col gap-2">
          {uploadedDocs.length > 0 ? (
            uploadedDocs.map(({ label, type }) => {

              const doc = documents.find((d: any) => d.type === type);

              return (
                // type is stable string, key=I_20, this div is I-20
                <div
                  key={type}
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono font-semibold">
                      PDF
                    </span>
                    <p className="text-sm text-gray-800">{label}</p>
                  </div>

                  <div className="flex gap-4">
                   
                    <button
                      onClick={() => window.open(doc?.fileUrl, '_blank')} className="text-sm text-blue-600 hover:underline"
                    >
                      Preview
                    </button>

                    {/* download docs */}
                    <a href={doc?.fileUrl}
                      download className="text-sm text-blue-600 hover:underline"
                    >
                      Download
                    </a>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-400">No documents uploaded yet.</p>
          )}
        </div>
      )}
    </SectionCard>
  );
};

export default DocumentsSection;
