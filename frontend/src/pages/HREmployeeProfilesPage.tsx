import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HRSidebar from "../components/HRSidebar";
import Pagination from "../components/Pagination";
import {
  searchEmployeeProfiles,
  type EmployeeSummary,
} from "../api/hrApi";

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

  const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [search, setSearch] = useState(getInitialSearch);
  const [page, setPage] = useState(getInitialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);

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
      setTotalEmployees(data.totalEmployees || 0);

      updateUrl(search, page);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      alert("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, page]);

  const formatLegalFullName = (employee: EmployeeSummary) => {
    return [employee.firstName, employee.middleName, employee.lastName]
      .filter(Boolean)
      .join(" ");
  };

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
                <p className="mt-2 text-sm text-gray-700">
                  Total employees: <span className="font-semibold">{totalEmployees}</span>
                </p>
              </div>

              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-[380px] rounded-lg border px-4 py-2"
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
              {search.trim()
                ? `No records found for "${search}".`
                : "No employee records found."}
            </div>
          ) : (
            <>
              <div className="space-y-5">
                {employees.map((emp) => (
                  <div
                    key={emp._id}
                    className="cursor-pointer rounded-xl border bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow"
                    onClick={() => navigate(`/hr/employees/${emp._id}`)}
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Name</p>
                        <Link
                          to={`/hr/employees/${emp._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-blue-700 hover:underline"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {formatLegalFullName(emp)}
                        </Link>
                        {emp.preferredName && (
                          <p className="text-xs text-gray-600">Preferred: {emp.preferredName}</p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">SSN</p>
                        <p className="text-sm text-gray-800">{emp.ssn || "N/A"}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Work Authorization Title</p>
                        <p className="text-sm text-gray-800">{emp.visaTitle || "N/A"}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Phone Number</p>
                        <p className="text-sm text-gray-800">{emp.cellPhone || "N/A"}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
                        <p className="break-all text-sm text-gray-800">{emp.email || "N/A"}</p>
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
