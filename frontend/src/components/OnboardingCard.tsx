import { useState } from "react";
import type { Onboarding } from "../api/hrApi";

interface OnboardingCardProps {
  application: Onboarding;
  onApprove: (id: string) => void;
  onReject: (id: string, feedback: string) => void;
}

const OnboardingCard = ({
  application,
  onApprove,
  onReject,
}: OnboardingCardProps) => {
  const [isRejecting, setIsRejecting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const getStatusClass = (status: string) => {
    if (status === "approved") {
      return "bg-green-100 text-green-700 border-green-200";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700 border-red-200";
    }

    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  const handleSubmitReject = () => {
    if (!feedback.trim()) {
      alert("Please enter feedback before rejecting.");
      return;
    }

    onReject(application._id, feedback);
    setIsRejecting(false);
    setFeedback("");
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
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
              onClick={() => onApprove(application._id)}
            >
              Approve
            </button>

            <button
              className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
              onClick={() => setIsRejecting(true)}
            >
              Reject
            </button>
          </div>

          {isRejecting && (
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
                  onClick={handleSubmitReject}
                >
                  Submit Reject
                </button>

                <button
                  className="rounded-lg border px-5 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setIsRejecting(false);
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
  );
};

export default OnboardingCard;