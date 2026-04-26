import { useEffect, useState } from "react";
import {
  approveApplication,
  getAllApplications,
  getApplicationsByStatus,
  rejectApplication,
  type OnboardingApplication,
} from "../api/hrApi";

const HRApplicationsPage = () => {
  const [applications, setApplications] = useState<OnboardingApplication[]>([]);
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

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">HR Applications</h1>
          <p className="text-gray-500">
            Review onboarding applications and update approval status.
          </p>
        </div>

        <select
          className="rounded border px-3 py-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <p>Loading applications...</p>
      ) : applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application._id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    {application.firstName} {application.lastName}
                  </h2>
                  <p className="text-sm text-gray-600">{application.email}</p>
                  <p className="text-sm text-gray-600">
                    Work Authorization:{" "}
                    {application.workAuthorization || "Not provided"}
                  </p>
                </div>

                <span className="rounded bg-gray-100 px-3 py-1 text-sm">
                  {application.status}
                </span>
              </div>

              {application.feedback && (
                <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-600">
                  Feedback: {application.feedback}
                </p>
              )}

              {application.status === "pending" && (
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <button
                      className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                      onClick={() => handleApprove(application._id)}
                    >
                      Approve
                    </button>

                    <button
                      className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                      onClick={() => setRejectingId(application._id)}
                    >
                      Reject
                    </button>
                  </div>

                  {rejectingId === application._id && (
                    <div className="space-y-2">
                      <textarea
                        className="w-full rounded border p-2"
                        placeholder="Enter rejection feedback..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                      />

                      <div className="flex gap-2">
                        <button
                          className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                          onClick={() => handleReject(application._id)}
                        >
                          Submit Reject
                        </button>

                        <button
                          className="rounded border px-4 py-2"
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
  );
};

export default HRApplicationsPage;