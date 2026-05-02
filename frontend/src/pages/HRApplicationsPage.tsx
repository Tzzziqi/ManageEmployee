import { useEffect, useState } from "react";
import {
  approveApplication,
  getAllApplications,
  getApplicationsByStatus,
  rejectApplication,
  type Onboarding,
  type OnboardingDocumentFile,
  type OnboardingDocuments,
} from "../api/hrApi";

import HRSidebar from "../components/HRSidebar";
import OnboardingCard from "../components/OnboardingCard";
import Pagination from "../components/Pagination"; 

const HRApplicationsPage = () => {
  const getInitialPage = () => {
    const params = new URLSearchParams(window.location.search);
    const pageFromUrl = Number(params.get("page"));
    return pageFromUrl > 0 ? pageFromUrl : 1;
  };

  const getInitialStatus = () => {
    const params = new URLSearchParams(window.location.search);
    const statusFromUrl = params.get("status");

    if (
      statusFromUrl === "pending" ||
      statusFromUrl === "approved" ||
      statusFromUrl === "rejected"
    ) {
      return statusFromUrl;
    }

    return "all";
  };

  const [applications, setApplications] = useState<Onboarding[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>(getInitialStatus);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<Onboarding | null>(null);
  const [feedback, setFeedback] = useState("");
  const [modalError, setModalError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [page, setPage] = useState(getInitialPage);
  const [totalPages, setTotalPages] = useState(1);

  const updateUrl = (newStatus: string, newPage: number) => {
    const params = new URLSearchParams();

    if (newStatus !== "all") {
      params.set("status", newStatus);
    }

    if (newPage !== 1) {
      params.set("page", String(newPage));
    }

    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    window.history.replaceState(null, "", newUrl);
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);

      let data;

      if (statusFilter === "all") {
        data = await getAllApplications(page);
      } else {
        data = await getApplicationsByStatus(
          statusFilter as "pending" | "approved" | "rejected",
          page
        );
      }

      setApplications(data.applications);
      setTotalPages(data.totalPages || 1);

      updateUrl(statusFilter, page);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      alert("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, page]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const openApplicationModal = (application: Onboarding) => {
    setSelectedApplication(application);
    setFeedback("");
    setModalError("");
  };

  const closeApplicationModal = () => {
    setSelectedApplication(null);
    setFeedback("");
    setModalError("");
  };

  const formatValue = (value?: string) => value || "N/A";

  const formatPhone = (
    phone: Onboarding["phone"],
    type: "mobile" | "work" = "mobile"
  ) => {
    if (!phone) {
      return "N/A";
    }

    if (typeof phone === "string") {
      return phone;
    }

    return phone[type] || "N/A";
  };

  const formatDate = (value?: string) => {
    if (!value) {
      return "N/A";
    }

    return new Date(value).toLocaleDateString();
  };

  const getDocumentRows = (
    documents?: Onboarding["documents"]
  ): OnboardingDocumentFile[] => {
    if (!documents) {
      return [];
    }

    if (Array.isArray(documents)) {
      return documents;
    }

    const documentMap = documents as OnboardingDocuments;
    const rows: OnboardingDocumentFile[] = [];

    if (documentMap.profilePicture) {
      rows.push({
        name: "Profile Picture",
        ...documentMap.profilePicture,
      });
    }

    if (documentMap.driverLicense) {
      rows.push({
        name: "Driver License",
        ...documentMap.driverLicense,
      });
    }

    if (documentMap.workAuthorization) {
      rows.push({
        name: "OPT Receipt",
        ...documentMap.workAuthorization,
      });
    }

    return rows.filter((document) => document.url || document.fileUrl);
  };

  const detailRows = selectedApplication
    ? [
        ["First Name", selectedApplication.firstName],
        ["Middle Name", selectedApplication.middleName],
        ["Last Name", selectedApplication.lastName],
        ["Preferred Name", selectedApplication.preferredName],
        ["Email", selectedApplication.email],
        ["Mobile Phone", formatPhone(selectedApplication.phone, "mobile")],
        ["Work Phone", formatPhone(selectedApplication.phone, "work")],
        ["Street", selectedApplication.address?.street],
        ["City", selectedApplication.address?.city],
        ["State", selectedApplication.address?.state],
        ["Zip", selectedApplication.address?.zip],
        ["Work Authorization", selectedApplication.workAuthorization],
        ["Visa Start Date", formatDate(selectedApplication.visaStartDate)],
        ["Visa End Date", formatDate(selectedApplication.visaEndDate)],
      ]
    : [];

  const handleApprove = async () => {
    if (!selectedApplication) {
      return;
    }

    // Feedback belongs only to rejection, so approval rejects non-empty notes.
    if (feedback.trim()) {
      setModalError("FeedBack only for Reject!");
      return;
    }

    try {
      setActionLoading(true);
      await approveApplication(selectedApplication._id);
      alert("Application approved successfully");
      closeApplicationModal();
      await fetchApplications();
    } catch (error) {
      console.error("Failed to approve application:", error);
      alert("Failed to approve application");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) {
      return;
    }

    // Rejection requires feedback; approval above is the only path that forbids it.
    if (!feedback.trim()) {
      setModalError("Please enter feedback before rejecting.");
      return;
    }

    try {
      setActionLoading(true);
      await rejectApplication(selectedApplication._id, feedback.trim());
      alert("Application rejected successfully");
      closeApplicationModal();
      await fetchApplications();
    } catch (error) {
      console.error("Failed to reject application:", error);
      alert("Failed to reject application");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f7f6f2]">
      <HRSidebar />

      <main className="flex-1 p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Onboarding Applications</h2>
              </div>

              <select
                className="rounded-lg border px-4 py-2"
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              No applications found.
            </div>
          ) : (
            <>
              <div className="space-y-5">
                {applications.map((application) => (
                  <OnboardingCard
                    key={application._id}
                    application={application}
                    onView={openApplicationModal}
                  />
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </main>

      {/* Read-only application modal; pending records expose the HR decision controls. */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white p-6">
              <div>
                <h2 className="text-2xl font-bold">View Application</h2>
                <p className="text-gray-600">
                  {selectedApplication.firstName} {selectedApplication.lastName}
                </p>
              </div>

              <button
                className="rounded-lg border px-4 py-2 hover:bg-gray-100"
                onClick={closeApplicationModal}
                disabled={actionLoading}
              >
                Close
              </button>
            </div>

            <div className="space-y-6 p-6">
              <section>
                <h3 className="mb-3 text-lg font-semibold">
                  Submitted Information
                </h3>
                <div className="grid grid-cols-1 gap-5 rounded-xl border bg-white p-5 md:grid-cols-2">
                  {detailRows.map(([label, value]) => (
                    <div key={label}>
                      <p className="text-sm font-semibold text-gray-500">
                        {label}
                      </p>
                      <p className="mt-1 text-gray-900">
                        {formatValue(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-lg font-semibold">Documents</h3>
                {getDocumentRows(selectedApplication.documents).length ? (
                  <div className="space-y-3">
                    {getDocumentRows(selectedApplication.documents).map((document, index) => (
                      <div
                        key={`${document.name || "document"}-${index}`}
                        className="flex items-center justify-between rounded-lg border bg-gray-50 p-4"
                      >
                        <span className="font-medium">
                          {document.name || `Document ${index + 1}`}
                        </span>
                        {document.url || document.fileUrl ? (
                          <a
                            className="font-semibold text-blue-700 hover:underline"
                            href={document.url || document.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-gray-500">No file</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border bg-gray-50 p-4 text-gray-600">
                    No documents uploaded.
                  </div>
                )}
              </section>

              {selectedApplication.status === "pending" && (
                <section className="border-t pt-6">
                  <label className="mb-2 block font-semibold" htmlFor="feedback">
                    Feedback
                  </label>
                  <textarea
                    id="feedback"
                    className="w-full rounded-lg border p-3"
                    rows={4}
                    value={feedback}
                    onChange={(event) => {
                      setFeedback(event.target.value);
                      setModalError("");
                    }}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    FeedBack for Reject
                  </p>

                  {modalError && (
                    <p className="mt-3 font-semibold text-red-600">
                      {modalError}
                    </p>
                  )}

                  <div className="mt-5 flex gap-3">
                    <button
                      className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                      onClick={handleApprove}
                      disabled={actionLoading}
                    >
                      Approve
                    </button>

                    <button
                      className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                      onClick={handleReject}
                      disabled={actionLoading}
                    >
                      Reject
                    </button>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRApplicationsPage;
