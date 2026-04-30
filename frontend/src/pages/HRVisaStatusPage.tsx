import { useEffect, useState } from "react";
import HRSidebar from "../components/HRSidebar";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/hr/visa";

const DOCUMENT_ORDER = ["OPT_RECEIPT", "OPT_EAD", "I_983", "I_20"];

const HRVisaStatusPage = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"in-progress" | "all">("in-progress");

  const fetchData = async () => {
    try {
      setLoading(true);

      const endpoint =
        view === "in-progress" ? "/in-progress" : "/all";

      const res = await axios.get(`${API_BASE_URL}${endpoint}`);

      setEmployees(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch visa data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [view]);

  const handleApprove = async (id: string, type: string) => {
    try {
      await axios.put(
        `${API_BASE_URL}/${id}/documents/${type}/approve`
      );
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Approve failed");
    }
  };

  const handleReject = async (
    id: string,
    type: string
  ) => {
    const feedback = prompt("Enter feedback");

    if (!feedback) return;

    try {
      await axios.put(
        `${API_BASE_URL}/${id}/documents/${type}/reject`,
        { feedback }
      );
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Reject failed");
    }
  };

  const getStatusColor = (status: string) => {
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

          <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm flex justify-between">
            <div>
              <h2 className="text-2xl font-bold">Visa Status Management</h2>
              <p className="text-gray-600 mt-1">
                Manage employee visa documents and approvals.
              </p>
            </div>

            <select
              value={view}
              onChange={(e) =>
                setView(e.target.value as any)
              }
              className="border rounded px-4 py-2"
            >
              <option value="in-progress">In Progress</option>
              <option value="all">All</option>
            </select>
          </div>

          {loading ? (
            <div className="bg-white p-6 rounded border">
              Loading...
            </div>
          ) : employees.length === 0 ? (
            <div className="bg-white p-6 rounded border">
              No data
            </div>
          ) : (
            <div className="space-y-6">
              {employees.map((emp) => (
                <div
                  key={emp._id}
                  className="bg-white rounded-xl border p-6 shadow-sm"
                >
                    
                  <div className="mb-4">
                    <h3 className="font-bold text-lg">
                      {emp.employee?.username}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {emp.employee?.email}
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    {DOCUMENT_ORDER.map((type) => {
                      const doc = emp.documents.find(
                        (d: any) =>
                          d.documentType === type
                      );

                      return (
                        <div
                          key={type}
                          className="border rounded p-3"
                        >
                          <p className="font-semibold text-sm mb-1">
                            {type}
                          </p>

                          <span
                            className={`text-xs px-2 py-1 rounded ${getStatusColor(
                              doc?.status
                            )}`}
                          >
                            {doc?.status}
                          </span>

                          {doc?.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              className="block text-blue-500 text-xs mt-2"
                            >
                              Preview
                            </a>
                          )}

                          {doc?.status === "pending" && (
                            <div className="mt-2 space-y-1">
                              <button
                                onClick={() =>
                                  handleApprove(emp._id, type)
                                }
                                className="w-full bg-green-600 text-white text-xs py-1 rounded"
                              >
                                Approve
                              </button>

                              <button
                                onClick={() =>
                                  handleReject(emp._id, type)
                                }
                                className="w-full bg-red-600 text-white text-xs py-1 rounded"
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
          )}
        </div>
      </main>
    </div>
  );
};

export default HRVisaStatusPage;