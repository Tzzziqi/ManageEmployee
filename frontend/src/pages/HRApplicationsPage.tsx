import { useEffect, useState } from "react";
import {
  approveApplication,
  getAllApplications,
  getApplicationsByStatus,
  rejectApplication,
  type Onboarding,
} from "../api/hrApi";

import HRSidebar from "../components/HRSidebar";
import OnboardingCard from "../components/OnboardingCard";

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

  const handleReject = async (id: string, feedback: string) => {
    try {
      await rejectApplication(id, feedback);
      alert("Application rejected successfully");
      fetchApplications();
    } catch (error) {
      console.error("Failed to reject application:", error);
      alert("Failed to reject application");
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
                <p className="mt-1 text-gray-600">
                  Review employee onboarding applications and update approval
                  status.
                </p>
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
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="rounded-lg border bg-white px-4 py-2 disabled:opacity-50"
                >
                  Prev
                </button>

                <span className="px-4 py-2">
                  Page {page} / {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="rounded-lg border bg-white px-4 py-2 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default HRApplicationsPage;