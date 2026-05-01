import { useEffect, useState } from "react";
import HRSidebar from "../components/HRSidebar";
import Pagination from "../components/Pagination";
import { searchEmployeeProfiles, type Onboarding } from "../api/hrApi";

const HREmployeeProfilesPage = () => {
  const getInitialPage = () => {
    const params = new URLSearchParams(window.location.search);
    const pageFromUrl = Number(params.get("page"));
    return pageFromUrl > 0 ? pageFromUrl : 1;
  };

  const getInitialSearch = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("keyword") || "";
  };

  const [employees, setEmployees] = useState<Onboarding[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState(getInitialSearch);
  const [page, setPage] = useState(getInitialPage);
  const [totalPages, setTotalPages] = useState(1);

  const updateUrl = (keyword: string, page: number) => {
    const params = new URLSearchParams();

    if (keyword) {
      params.set("keyword", keyword);
    }

    if (page !== 1) {
      params.set("page", String(page));
    }

    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    window.history.replaceState(null, "", newUrl);
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const data = await searchEmployeeProfiles(search, page);

      setEmployees(data.employees);
      setTotalPages(data.totalPages || 1);

      updateUrl(search, page);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      alert("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchEmployees();
    }, 300);

    return () => clearTimeout(delay);
  }, [search, page]);

  return (
    <div className="flex min-h-screen bg-[#f7f6f2]">
      <HRSidebar />

      <main className="flex-1 p-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Employee Profiles</h2>
                <p className="mt-1 text-gray-600">
                  View and search all employees.
                </p>
              </div>

              <input
                type="text"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border px-4 py-2"
              />
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              Loading employees...
            </div>
          ) : employees.length === 0 ? (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              No employees found.
            </div>
          ) : (
            <>
              <div className="space-y-5">
                {employees.map((emp) => (
                  <div
                    key={emp._id}
                    className="rounded-xl border bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                        {emp.firstName?.[0]}
                        {emp.lastName?.[0]}
                      </div>

                      <div>
                        <h3 className="font-semibold">
                          {emp.firstName} {emp.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{emp.email}</p>
                        <p className="text-sm text-gray-600">
                          {emp.workAuthorization || "N/A"}
                        </p>
                      </div>
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

export default HREmployeeProfilesPage;