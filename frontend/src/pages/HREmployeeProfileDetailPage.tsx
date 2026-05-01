import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import HRSidebar from "../components/HRSidebar";
import {
  getEmployeeProfileById,
  type EmployeeProfile,
  type EmployeeUploadedDocument,
} from "../api/hrApi";

const HREmployeeProfileDetailPage = () => {
  const { id } = useParams();

  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<
    EmployeeUploadedDocument[]
  >([]);
  const [onboardingDocuments, setOnboardingDocuments] = useState<
    Array<{ name?: string; url?: string }>
  >([]);
  const [loading, setLoading] = useState(false);

  const formatDate = (value?: string) => {
    if (!value) {
      return "N/A";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString();
  };

  const displayValue = (value?: string) => value || "N/A";

  const loadProfile = async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      const data = await getEmployeeProfileById(id);
      setEmployee(data.employee);
      setUploadedDocuments(data.uploadedDocuments || []);
      setOnboardingDocuments(data.onboardingDocuments || []);
    } catch (error) {
      console.error("Failed to load employee profile:", error);
      alert("Failed to load employee profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id]);

  const combinedDocuments = [
    ...uploadedDocuments.map((document) => ({
      label: document.type,
      url: document.fileUrl,
      uploadedAt: document.uploadedAt,
    })),
    ...onboardingDocuments
      .filter((document) => document?.url)
      .map((document) => ({
        label: document.name || "Uploaded Document",
        url: document.url as string,
        uploadedAt: undefined,
      })),
  ];

  return (
    <div className="flex min-h-screen bg-[#f7f6f2]">
      <HRSidebar />

      <main className="flex-1 p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Employee Full Profile</h2>
              </div>
              <Link
                to="/hr/employees"
                className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Go Back
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="rounded-xl border bg-white p-6 shadow-sm">Loading profile...</div>
          ) : !employee ? (
            <div className="rounded-xl border bg-white p-6 shadow-sm">Employee not found.</div>
          ) : (
            <div className="space-y-5">
              <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">Name</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <p><span className="font-medium">First Name:</span> {displayValue(employee.firstName)}</p>
                  <p><span className="font-medium">Last Name:</span> {displayValue(employee.lastName)}</p>
                  <p><span className="font-medium">Middle Name:</span> {displayValue(employee.middleName)}</p>
                  <p><span className="font-medium">Preferred Name:</span> {displayValue(employee.preferredName)}</p>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  {employee.profilePicture ? (
                    <img
                      src={employee.profilePicture}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-lg font-semibold text-gray-600">
                      {employee.firstName?.[0] || "N"}
                      {employee.lastName?.[0] || "A"}
                    </div>
                  )}
                  <div>
                    <p><span className="font-medium">Email:</span> {displayValue(employee.email)}</p>
                    <p><span className="font-medium">SSN:</span> {displayValue(employee.ssn)}</p>
                    <p><span className="font-medium">Date of Birth:</span> {formatDate(employee.dateOfBirth)}</p>
                    <p><span className="font-medium">Gender:</span> {displayValue(employee.gender)}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">Address</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <p><span className="font-medium">Building/Apt #:</span> {displayValue(employee.address?.building)}</p>
                  <p><span className="font-medium">Street:</span> {displayValue(employee.address?.street)}</p>
                  <p><span className="font-medium">City:</span> {displayValue(employee.address?.city)}</p>
                  <p><span className="font-medium">State:</span> {displayValue(employee.address?.state)}</p>
                  <p><span className="font-medium">Zip:</span> {displayValue(employee.address?.zip)}</p>
                </div>
              </section>

              <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">Contact Info</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <p><span className="font-medium">Cell Phone:</span> {displayValue(employee.cellPhone)}</p>
                  <p><span className="font-medium">Work Phone:</span> {displayValue(employee.workPhone)}</p>
                </div>
              </section>

              <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">Employment</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <p><span className="font-medium">Visa Title:</span> {displayValue(employee.visaTitle)}</p>
                  <p><span className="font-medium">Start Date:</span> {formatDate(employee.visaStart)}</p>
                  <p><span className="font-medium">End Date:</span> {formatDate(employee.visaEnd)}</p>
                </div>
              </section>

              <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">Emergency Contact</h3>
                {employee.emergencyContacts?.length ? (
                  <div className="space-y-3">
                    {employee.emergencyContacts.map((contact, index) => (
                      <div key={`${contact.firstName}-${contact.lastName}-${index}`} className="rounded border p-4">
                        <p><span className="font-medium">First Name:</span> {displayValue(contact.firstName)}</p>
                        <p><span className="font-medium">Last Name:</span> {displayValue(contact.lastName)}</p>
                        <p><span className="font-medium">Middle Name:</span> {displayValue(contact.middleName)}</p>
                        <p><span className="font-medium">Phone:</span> {displayValue(contact.phone)}</p>
                        <p><span className="font-medium">Email:</span> {displayValue(contact.email)}</p>
                        <p><span className="font-medium">Relationship:</span> {displayValue(contact.relationship)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No emergency contact information available.</p>
                )}
              </section>

              <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">Documents</h3>
                {combinedDocuments.length ? (
                  <div className="space-y-3">
                    {combinedDocuments.map((document, index) => (
                      <div key={`${document.label}-${index}`} className="flex items-center justify-between rounded border p-4">
                        <div>
                          <p className="font-medium">{displayValue(document.label)}</p>
                          {document.uploadedAt && (
                            <p className="text-xs text-gray-600">Uploaded: {formatDate(document.uploadedAt)}</p>
                          )}
                        </div>
                        <a
                          href={document.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-blue-700 hover:underline"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No uploaded documents found.</p>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HREmployeeProfileDetailPage;
