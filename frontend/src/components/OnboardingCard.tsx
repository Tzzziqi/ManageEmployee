import type { Onboarding } from "../api/hrApi";

interface OnboardingCardProps {
  application: Onboarding;
  onView: (application: Onboarding) => void;
}

const OnboardingCard = ({
  application,
  onView,
}: OnboardingCardProps) => {
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
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold">
            {application.firstName} {application.lastName}
          </h3>
          <p className="text-gray-600">{application.email}</p>
        </div>

        <span
          className={`rounded-md border px-3 py-1 text-sm font-semibold ${getStatusClass(
            application.status
          )}`}
        >
          Onboarding {application.status}
        </span>
      </div>

      <button
        className="rounded-lg border px-5 py-2 font-semibold hover:bg-gray-100"
        onClick={() => onView(application)}
      >
        View Application
      </button>
    </div>
  );
};

export default OnboardingCard;
