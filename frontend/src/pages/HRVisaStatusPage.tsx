import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVisaStatuses, type VisaStatusRecord } from "../api/hrApi";
import HRSidebar from "../components/HRSidebar";
import Pagination from "../components/Pagination";

type VisaView = "in-progress" | "all";

const getInitialPage = () => {
  const params = new URLSearchParams(window.location.search);
  const pageFromUrl = Number(params.get("page"));
  return pageFromUrl > 0 ? pageFromUrl : 1;
};

const getInitialView = (): VisaView => {
  const params = new URLSearchParams(window.location.search);
  return params.get("view") === "all" ? "all" : "in-progress";
};

const getInitialSearch = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("keyword") || "";
};

const HRVisaStatusPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<VisaStatusRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<VisaView>(getInitialView);
  const [search, setSearch] = useState(getInitialSearch);
  const [page, setPage] = useState(getInitialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const updateUrl = (newView: VisaView, newPage: number, keyword: string) => {
    const params = new URLSearchParams();

    if (newView !== "in-progress") {
      params.set("view", newView);
    }

    if (keyword.trim()) {
      params.set("keyword", keyword.trim());
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
      const data = await getVisaStatuses(view, page, search);

      setEmployees(data.employees || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      updateUrl(view, page, search);
    } catch (error: any) {
      console.error("Failed to fetch visa data:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to fetch visa data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 250);

    return () => clearTimeout(timer);
  }, [view, page, search]);

  const handleViewChange = (value: VisaView) => {
    setView(value);
    setPage(1);
  };

  const formatDate = (value?: string) => {
    if (!value) {
      return "N/A";
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
  };

  const formatDaysRemaining = (days: number | null) => {
    if (days === null || days === undefined) {
      return "N/A";
    }

    return days < 0 ? `${Math.abs(days)} days expired` : `${days} days`;
  };

  const getLegalFullName = (employee: VisaStatusRecord) => {
    const onboardingName = [
      employee.onboarding?.firstName,
      employee.onboarding?.middleName,
      employee.onboarding?.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    return onboardingName || employee.employee?.username || "Unknown employee";
  };

  const getResultText = () => {
    if (loading) {
      return "Loading...";
    }

    if (total === 0) {
      return search.trim() ? `No records found for "${search}".` : "No records found.";
    }

    if (total === 1) {
      return "1 record found.";
    }

    return `${total} records found.`;
  };

  return (
    <div className="flex min-h-screen bg-[#f7f6f2]">
      <HRSidebar />

      <main className="flex-1 p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Visa Status Management</h2>
                <p className="mt-2 text-sm text-gray-700">{getResultText()}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  className="w-64 rounded border px-4 py-2"
                />

                <select
                  value={view}
                  onChange={(event) => handleViewChange(event.target.value as VisaView)}
                  className="rounded border px-4 py-2"
                >
                  <option value="in-progress">In Progress</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="rounded border bg-white p-6">Loading...</div>
          ) : employees.length === 0 ? (
            <div className="rounded border bg-white p-6">
              {search.trim() ? `No records found for "${search}".` : "No data"}
            </div>
          ) : (
            <>
              <div className="space-y-5">
                {employees.map((employee) => (
                  <button
                    key={employee._id}
                    onClick={() => navigate(`/hr/visa/${employee._id}`)}
                    className="w-full rounded-xl border bg-white p-6 text-left shadow-sm transition hover:border-blue-300 hover:shadow"
                  >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr]">
                      <div>
                        <p className="text-xs uppercase text-gray-500">Legal Full Name</p>
                        <p className="font-semibold">{getLegalFullName(employee)}</p>
                        <p className="break-all text-sm text-gray-600">
                          {employee.employee?.email || employee.onboarding?.email || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">Title</p>
                        <p className="font-semibold">{employee.workAuthorization || "N/A"}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">Start Date</p>
                        <p className="text-sm text-gray-700">
                          {formatDate(employee.visaStartDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">End Date</p>
                        <p className="text-sm text-gray-700">
                          {formatDate(employee.visaEndDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">Days Remaining</p>
                        <p className="font-semibold">
                          {formatDaysRemaining(employee.daysRemaining)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default HRVisaStatusPage;
