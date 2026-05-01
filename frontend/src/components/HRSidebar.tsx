import { useLocation, useNavigate } from "react-router-dom";

const HRSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    const isEmployeeProfilesPath =
      path === "/hr/employees" && location.pathname.startsWith("/hr/employees");

    return location.pathname === path || isEmployeeProfilesPath
      ? "bg-gray-100 text-blue-700 font-semibold"
      : "text-gray-700 hover:bg-gray-100";
  };

  return (
    <aside className="w-64 border-r bg-white">
      <div className="border-b p-6">
        <h1 className="text-xl font-bold">myHR Portal</h1>
        <p className="text-gray-600">HR</p>
      </div>

      <nav className="p-4 space-y-2">
        <button
          onClick={() => navigate("/hr/onboarding")}
          className={`w-full rounded px-4 py-3 text-left ${isActive(
            "/hr/onboarding"
          )}`}
        >
          Onboarding
        </button>

        <button
          onClick={() => navigate("/hr/employees")}
          className={`w-full rounded px-4 py-3 text-left ${isActive(
            "/hr/employees"
          )}`}
        >
          Employee Profiles
        </button>

        <button
          onClick={() => navigate("/hr/visa")}
          className={`w-full rounded px-4 py-3 text-left ${isActive(
            "/hr/visa"
          )}`}
        >
          Visa Status
        </button>

        <button
          onClick={() => navigate("/login")}
          className="w-full rounded px-4 py-3 text-left text-gray-700 hover:bg-gray-100"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default HRSidebar;