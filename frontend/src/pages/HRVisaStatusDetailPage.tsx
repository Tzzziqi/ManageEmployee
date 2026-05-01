import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  approveVisaDoc,
  getVisaStatusById,
  rejectVisaDoc,
  sendVisaNextStepNotification,
  type VisaDocument,
  type VisaStatusRecord,
} from "../api/hrApi";
import HRSidebar from "../components/HRSidebar";

const DOCUMENT_ORDER: VisaDocument["documentType"][] = [
  "OPT_RECEIPT",
  "OPT_EAD",
  "I_983",
  "I_20",
];

const DOCUMENT_LABELS: Record<VisaDocument["documentType"], string> = {
  OPT_RECEIPT: "OPT Receipt",
  OPT_EAD: "OPT EAD",
  I_983: "I-983",
  I_20: "I-20",
};

const HRVisaStatusDetailPage = () => {
  const { id } = useParams();
  const [visa, setVisa] = useState<VisaStatusRecord | null>(null);
  const [selectedType, setSelectedType] = useState<VisaDocument["documentType"] | null>(null);
  const [approvedForNotification, setApprovedForNotification] = useState<
    VisaDocument["documentType"] | null
  >(null);
  const [feedback, setFeedback] = useState("");
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedDocument = useMemo(() => {
    if (!visa || !selectedType) {
      return null;
    }

    return visa.documents.find((document) => document.documentType === selectedType) || null;
  }, [visa, selectedType]);

  const selectedIndex = selectedType ? DOCUMENT_ORDER.indexOf(selectedType) : -1;
  const nextDocumentType =
    selectedIndex >= 0 && selectedIndex < DOCUMENT_ORDER.length - 1
      ? DOCUMENT_ORDER[selectedIndex + 1]
      : null;

  const fetchVisa = async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      const data = await getVisaStatusById(id);
      setVisa(data.visa);
    } catch (error: any) {
      console.error("Failed to fetch visa detail:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to fetch visa detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisa();
  }, [id]);

  const getLegalFullName = () => {
    if (!visa) {
      return "Unknown employee";
    }

    const onboardingName = [
      visa.onboarding?.firstName,
      visa.onboarding?.middleName,
      visa.onboarding?.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    return onboardingName || visa.employee?.username || "Unknown employee";
  };

  const formatDate = (value?: string) => {
    if (!value) {
      return "N/A";
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
  };

  const getStatusLabel = (status?: string) => {
    if (status === "not_started" || status === "not_uploaded" || !status) {
      return "Not Uploaded";
    }

    return status[0].toUpperCase() + status.slice(1);
  };

  const getStatusClass = (status?: string) => {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-600";
  };

  const canOpenDocument = (document: VisaDocument) => {
    return document.status === "pending" || document.status === "approved";
  };

  const closeModal = () => {
    setSelectedType(null);
    setFeedback("");
    setShowFeedbackInput(false);
  };

  const handleApprove = async () => {
    if (!id || !selectedDocument) {
      return;
    }

    try {
      await approveVisaDoc(id, selectedDocument.documentType);
      await fetchVisa();
      setShowFeedbackInput(false);
      setFeedback("");
    } catch (error: any) {
      alert(error.response?.data?.message || "Approve failed");
    }
  };

  const handleReject = async () => {
    if (!id || !selectedDocument || !feedback.trim()) {
      return;
    }

    try {
      await rejectVisaDoc(id, selectedDocument.documentType, feedback.trim());
      await fetchVisa();
      closeModal();
    } catch (error: any) {
      alert(error.response?.data?.message || "Reject failed");
    }
  };

  const handleSendNotification = async () => {
    if (!id || !selectedDocument) {
      return;
    }

    try {
      await sendVisaNextStepNotification(id, selectedDocument.documentType);
      alert("Notification email sent successfully");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to send notification");
    }
  };

  const renderFileActions = (document: VisaDocument) => {
    if (!document.fileUrl) {
      return <p className="text-sm text-gray-600">No uploaded file available.</p>;
    }

    return (
      <div className="flex flex-wrap gap-3">
        <a
          href={document.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded border border-blue-600 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
        >
          Preview uploaded file
        </a>
        <a
          href={document.fileUrl}
          download
          className="rounded border border-blue-600 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
        >
          Download uploaded file
        </a>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#f7f6f2]">
      <HRSidebar />

      <main className="flex-1 p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Employee Visa Status</h2>
                <p className="mt-2 text-sm text-gray-700">{getLegalFullName()}</p>
              </div>
              <Link
                to="/hr/visa"
                className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Go Back
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="rounded border bg-white p-6">Loading...</div>
          ) : !visa ? (
            <div className="rounded border bg-white p-6">Visa record not found.</div>
          ) : (
            <>
              <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase text-gray-500">Title</p>
                    <p className="font-semibold">{visa.workAuthorization || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-500">Start Date</p>
                    <p>{formatDate(visa.visaStartDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-500">End Date</p>
                    <p>{formatDate(visa.visaEndDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-500">Email</p>
                    <p className="break-all">{visa.employee?.email || visa.onboarding?.email || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {DOCUMENT_ORDER.map((documentType) => {
                  const document =
                    visa.documents.find((item) => item.documentType === documentType) || {
                      documentType,
                      status: "not_started" as const,
                    };
                  const clickable = canOpenDocument(document);

                  return (
                    <button
                      key={documentType}
                      disabled={!clickable}
                      onClick={() => {
                        if (clickable) {
                          setSelectedType(documentType);
                        }
                      }}
                      className="rounded-xl border bg-white p-5 text-left shadow-sm transition enabled:hover:border-blue-300 enabled:hover:shadow disabled:cursor-not-allowed disabled:opacity-80"
                    >
                      <p className="text-lg font-semibold">{DOCUMENT_LABELS[documentType]}</p>
                      <span
                        className={`mt-3 inline-block rounded px-2 py-1 text-xs ${getStatusClass(
                          document.status
                        )}`}
                      >
                        {getStatusLabel(document.status)}
                      </span>
                      {document.feedback && (
                        <p className="mt-3 text-sm text-red-700">Feedback: {document.feedback}</p>
                      )}
                      {!clickable && (
                        <p className="mt-3 text-xs text-gray-500">
                          {document.status === "rejected"
                            ? "Employee must re-upload to continue."
                            : "No HR action available."}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">
                  {DOCUMENT_LABELS[selectedDocument.documentType]}
                </h3>
                <span
                  className={`mt-2 inline-block rounded px-2 py-1 text-xs ${getStatusClass(
                    selectedDocument.status
                  )}`}
                >
                  {getStatusLabel(selectedDocument.status)}
                </span>
              </div>
              <button
                onClick={closeModal}
                className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              {renderFileActions(selectedDocument)}

              {selectedDocument.status === "pending" && (
                <div className="space-y-3 border-t pt-4">
                  <div className="flex gap-2">
                    <button
                      onClick={handleApprove}
                      className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setShowFeedbackInput(true)}
                      className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>

                  {showFeedbackInput && (
                    <div className="space-y-2">
                      <textarea
                        value={feedback}
                        onChange={(event) => setFeedback(event.target.value)}
                        placeholder="Feedback"
                        className="min-h-24 w-full rounded border px-3 py-2"
                      />
                      <button
                        onClick={handleReject}
                        disabled={!feedback.trim()}
                        className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  )}
                </div>
              )}

              {selectedDocument.status === "approved" && nextDocumentType && (
                <div className="border-t pt-4">
                  <button
                    onClick={handleSendNotification}
                    className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Send Notification
                  </button>
                  <p className="mt-2 text-xs text-gray-600">
                    Notify employee to upload {DOCUMENT_LABELS[nextDocumentType]}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRVisaStatusDetailPage;
