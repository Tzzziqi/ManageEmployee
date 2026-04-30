import { useEffect, useState } from "react";
import {
  approveApplication,
  getAllApplications,
  getApplicationsByStatus,
  rejectApplication,
  type Onboarding,
} from "../api/hrApi";

const HRApplicationsPage = () => {
  const [applications, setApplications] = useState<Onboarding[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const fetchApplications = async () => {
    try {
      setLoading(true);

      if (statusFilter === "all") {
        const data = await getAllApplications();
        setApplications(data);
      } else {
        const data = await getApplicationsByStatus(
          statusFilter as "pending" | "approved" | "rejected"
        );
        setApplications(data);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      alert("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleApprove = async (id: string) => {
    try {
      await approveApplication(id);
      alert("Application approved successfully");
      fetchApplications();
    } catch (error) {
      console.error("Failed to approve application:", error);
      alert("Failed to approve application");
    }
  };

  const handleReject = async (id: string) => {
    if (!feedback.trim()) {
      alert("Please enter feedback before rejecting.");
      return;
    }

    try {
      await rejectApplication(id, feedback);
      alert("Application rejected successfully");
      setRejectingId(null);
      setFeedback("");
      fetchApplications();
    } catch (error) {
      console.error("Failed to reject application:", error);
      alert("Failed to reject application");
    }
  };

  const getStatusClass = (status: string) => {
    if (status === "approved") {
      return "bg-green-100 text-green-700 border-green-200";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700 border-red-200";
    }

    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  return (
    <div className="flex min-h-screen bg-[#f7f6f2]">
      <aside className="w-64 border-r bg-white">
        <div className="border-b p-6">
          <h1 className="text-xl font-bold">myHR Portal</h1>
          <p className="text-gray-600">HR</p>
        </div>

        <nav className="p-4">
          <button className="mb-2 w-full rounded bg-gray-100 px-4 py-3 text-left font-semibold text-blue-700">
            Onboarding
          </button>

          <button className="mb-2 w-full rounded px-4 py-3 text-left text-gray-700 hover:bg-gray-100">
            Employee Profiles
          </button>

          <button className="mb-2 w-full rounded px-4 py-3 text-left text-gray-700 hover:bg-gray-100">
            Visa Status
          </button>

          <button className="w-full rounded px-4 py-3 text-left text-gray-700 hover:bg-gray-100">
            Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Onboarding Applications</h2>
                <p className="mt-1 text-gray-600">
                  Review employee onboarding applications and update approval status.
                </p>
              </div>

              <select
                className="rounded-lg border px-4 py-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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
            <div className="space-y-5">
              {applications.map((application) => (
                <div
                  key={application._id}
                  className="rounded-xl border bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                        {application.firstName?.[0]}
                        {application.lastName?.[0]}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold">
                          {application.firstName} {application.lastName}
                        </h3>
                        <p className="text-gray-600">{application.email}</p>
                        <p className="text-gray-600">
                          {application.workAuthorization || "No work authorization"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-md border px-3 py-1 text-sm font-semibold ${getStatusClass(
                        application.status
                      )}`}
                    >
                      Onboarding {application.status}
                    </span>
                  </div>

                  <div className="mb-5 grid grid-cols-4 gap-4 border-t pt-4">
                    <div>
                      <p className="text-sm font-semibold uppercase text-gray-500">
                        First Name
                      </p>
                      <p>{application.firstName}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold uppercase text-gray-500">
                        Last Name
                      </p>
                      <p>{application.lastName}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold uppercase text-gray-500">
                        Preferred Name
                      </p>
                      <p>{application.preferredName || "—"}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold uppercase text-gray-500">
                        Phone
                      </p>
                      <p>{application.phone || "—"}</p>
                    </div>
                  </div>

                  {application.feedback && (
                    <div className="mb-5 rounded-lg bg-red-50 p-3 text-red-700">
                      Feedback: {application.feedback}
                    </div>
                  )}

                  {application.status === "pending" && (
                    <div className="border-t pt-4">
                      <div className="mb-3 flex gap-3">
                        <button
                          className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700"
                          onClick={() => handleApprove(application._id)}
                        >
                          Approve
                        </button>

                        <button
                          className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
                          onClick={() => setRejectingId(application._id)}
                        >
                          Reject
                        </button>
                      </div>

                      {rejectingId === application._id && (
                        <div className="rounded-lg border bg-gray-50 p-4">
                          <textarea
                            className="mb-3 w-full rounded-lg border p-3"
                            rows={3}
                            placeholder="Enter rejection feedback..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                          />

                          <div className="flex gap-3">
                            <button
                              className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
                              onClick={() => handleReject(application._id)}
                            >
                              Submit Reject
                            </button>

                            <button
                              className="rounded-lg border px-5 py-2 hover:bg-gray-100"
                              onClick={() => {
                                setRejectingId(null);
                                setFeedback("");
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HRApplicationsPage;