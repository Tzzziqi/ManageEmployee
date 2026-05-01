import { useEffect, useState } from "react";
import {
  approveVisaDoc,
  getVisaStatuses,
  rejectVisaDoc,
  sendVisaReminder,
} from "../api/hrApi";
import HRSidebar from "../components/HRSidebar";
import Pagination from "../components/Pagination";

const DOCUMENT_ORDER = ["OPT_RECEIPT", "OPT_EAD", "I_983", "I_20"];

type VisaView = "in-progress" | "all";

interface VisaDocument {
  documentType: string;
  status: "not_uploaded" | "pending" | "approved" | "rejected";
  fileUrl?: string;
}

interface VisaStatusEmployee {
  _id: string;
  employee?: {
    username?: string;
    email?: string;
  };
  documents: VisaDocument[];
}

const getInitialPage = () => {
  const params = new URLSearchParams(window.location.search);
  const pageFromUrl = Number(params.get("page"));
  return pageFromUrl > 0 ? pageFromUrl : 1;
};

const getInitialView = (): VisaView => {
  const params = new URLSearchParams(window.location.search);
  return params.get("view") === "all" ? "all" : "in-progress";
};

const HRVisaStatusPage = () => {
  const [employees, setEmployees] = useState<VisaStatusEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<VisaView>(getInitialView);

  const [page, setPage] = useState(getInitialPage);
  const [totalPages, setTotalPages] = useState(1);

  const updateUrl = (newView: VisaView, newPage: number) => {
    const params = new URLSearchParams();

    if (newView !== "in-progress") {
      params.set("view", newView);
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

  const fetchData = async () => {
    try {
      setLoading(true);

      const data = await getVisaStatuses(view, page);

      setEmployees(data.employees || []);
      setTotalPages(data.totalPages || 1);
      updateUrl(view, page);
    } catch (error: any) {
      console.error("Failed to fetch visa data:", error.response?.data || error);

      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to fetch visa data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [view, page]);

  const handleViewChange = (value: VisaView) => {
    setView(value);
    setPage(1);
  };

  const handleApprove = async (id: string, type: string) => {
    try {
      await approveVisaDoc(id, type);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Approve failed");
    }
  };

  const handleReject = async (id: string, type: string) => {
    const feedback = prompt("Enter feedback");

    if (!feedback) {
      return;
    }

    try {
      await rejectVisaDoc(id, type, feedback);

      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Reject failed");
    }
  };

  const handleSendReminder = async (id: string, type: string) => {
    try {
      await sendVisaReminder(id, type);
      alert("Reminder email sent successfully");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to send reminder email");
    }
  };

  const getStatusColor = (status?: string) => {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-500";
  };

  return (
    <div className="flex min-h-screen bg-[#f7f6f2]">
      <HRSidebar />

      <main className="flex-1 p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex justify-between rounded-xl border bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold">Visa Status Management</h2>
              <p className="mt-1 text-gray-600">
                Manage employee visa documents and approvals.
              </p>
            </div>

            <select
              value={view}
              onChange={(e) => handleViewChange(e.target.value as VisaView)}
              className="rounded border px-4 py-2"
            >
              <option value="in-progress">In Progress</option>
              <option value="all">All</option>
            </select>
          </div>

          {loading ? (
            <div className="rounded border bg-white p-6">Loading...</div>
          ) : employees.length === 0 ? (
            <div className="rounded border bg-white p-6">No data</div>
          ) : (
            <>
              <div className="space-y-6">
                {employees.map((emp) => (
                  <div
                    key={emp._id}
                    className="rounded-xl border bg-white p-6 shadow-sm"
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-bold">
                        {emp.employee?.username || "Unknown employee"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {emp.employee?.email || "No email"}
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      {DOCUMENT_ORDER.map((type) => {
                        const doc = emp.documents.find(
                          (item) => item.documentType === type
                        );
                        const status = doc?.status || "not_uploaded";

                        return (
                          <div key={type} className="rounded border p-3">
                            <p className="mb-1 text-sm font-semibold">
                              {type}
                            </p>

                            <span
                              className={`rounded px-2 py-1 text-xs ${getStatusColor(
                                status
                              )}`}
                            >
                              {status}
                            </span>

                            {doc?.fileUrl && (
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 block text-xs text-blue-500"
                              >
                                Preview
                              </a>
                            )}

                            <button
                              onClick={() => handleSendReminder(emp._id, type)}
                              className="mt-2 w-full rounded bg-blue-600 py-1 text-xs text-white hover:bg-blue-700"
                            >
                              Send Reminder
                            </button>

                            {status === "pending" && (
                              <div className="mt-2 space-y-1">
                                <button
                                  onClick={() => handleApprove(emp._id, type)}
                                  className="w-full rounded bg-green-600 py-1 text-xs text-white"
                                >
                                  Approve
                                </button>

                                <button
                                  onClick={() => handleReject(emp._id, type)}
                                  className="w-full rounded bg-red-600 py-1 text-xs text-white"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
    </div>
  );
};

export default HRVisaStatusPage;
