import axiosInstance from "./axiosInstance";

export interface OnboardingDocumentFile {
  name?: string;
  url?: string;
  fileUrl?: string;
  s3Key?: string;
  uploadedAt?: string;
}

export interface OnboardingDocuments {
  profilePicture?: OnboardingDocumentFile;
  workAuthorization?: OnboardingDocumentFile;
  driverLicense?: OnboardingDocumentFile;
}

export interface Onboarding {
  _id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  email: string;
  phone?: string | {
    mobile?: string;
    work?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  workAuthorization?: string;
  visaStartDate?: string;
  visaEndDate?: string;
  documents?: OnboardingDocuments | OnboardingDocumentFile[];
  status: "pending" | "approved" | "rejected";
  feedback?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeSummary {
  _id: string;
  userId?: {
    _id: string;
    username?: string;
    email?: string;
    role?: "employee" | "hr";
  };
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  email: string;
  ssn?: string;
  visaTitle?: string;
  cellPhone?: string;
}

export interface EmployeeUploadedDocument {
  _id: string;
  type: string;
  fileUrl: string;
  status?: string;
  uploadedAt?: string;
}

export interface EmployeeProfile {
  _id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  profilePicture?: string;
  email: string;
  ssn?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "no_answer";
  address?: {
    building?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  cellPhone?: string;
  workPhone?: string;
  visaTitle?: string;
  visaStart?: string;
  visaEnd?: string;
  emergencyContacts?: Array<{
    firstName: string;
    lastName: string;
    middleName?: string;
    phone: string;
    email?: string;
    relationship: string;
  }>;
}

export interface ApplicationsResponse {
  applications: Onboarding[];
  page: number;
  totalPages: number;
}

export interface EmployeeSearchResponse {
  total: number;
  totalEmployees: number;
  employees: EmployeeSummary[];
  page: number;
  totalPages: number;
}

export interface EmployeeProfileResponse {
  employee: EmployeeProfile;
  uploadedDocuments: EmployeeUploadedDocument[];
  onboardingDocuments: OnboardingDocumentFile[];
}

export interface VisaDocument {
  documentType: "OPT_RECEIPT" | "OPT_EAD" | "I_983" | "I_20";
  status: "not_started" | "not_uploaded" | "pending" | "approved" | "rejected";
  fileName?: string;
  fileUrl?: string;
  feedback?: string;
  uploadedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
}

export interface VisaStatusRecord {
  _id: string;
  employee?: {
    username?: string;
    email?: string;
  };
  onboarding?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    preferredName?: string;
    email?: string;
    workAuthorization?: string;
    visaStartDate?: string;
    visaEndDate?: string;
  };
  workAuthorization?: string;
  visaStartDate?: string;
  visaEndDate?: string;
  daysRemaining: number | null;
  documents: VisaDocument[];
  approvedDocuments: VisaDocument[];
  nextStep: VisaDocument | null;
}

export interface VisaStatusesResponse {
  employees: VisaStatusRecord[];
  page: number;
  totalPages: number;
  total: number;
}

export interface VisaStatusDetailResponse {
  visa: VisaStatusRecord;
}

export const getAllApplications = async (
  page: number = 1
): Promise<ApplicationsResponse> => {
  const response = await axiosInstance.get("/hr/applications", {
    params: {
      page,
      limit: 5,
    },
  });

  return response.data;
};

export const getApplicationsByStatus = async (
  status: "pending" | "approved" | "rejected",
  page: number = 1
): Promise<ApplicationsResponse> => {
  const response = await axiosInstance.get(`/hr/applications/status/${status}`, {
    params: {
      page,
      limit: 5,
    },
  });

  return response.data;
};

export const searchEmployeeProfiles = async (
  keyword: string,
  page: number = 1
): Promise<EmployeeSearchResponse> => {
  const response = await axiosInstance.get("/hr/employees", {
    params: {
      keyword,
      page,
      limit: 5,
    },
  });

  return response.data;
};

export const getEmployeeProfileById = async (
  id: string
): Promise<EmployeeProfileResponse> => {
  const response = await axiosInstance.get(`/hr/employees/${id}`);
  return response.data;
};

export const approveApplication = async (id: string): Promise<Onboarding> => {
  const response = await axiosInstance.put(`/hr/applications/${id}/approve`);
  return response.data.application;
};

export const rejectApplication = async (
  id: string,
  feedback: string
): Promise<Onboarding> => {
  const response = await axiosInstance.put(`/hr/applications/${id}/reject`, {
    feedback,
  });

  return response.data.application;
};

// visa
export const getVisaStatuses = async (
  view: "in-progress" | "all",
  page: number = 1,
  keyword: string = ""
): Promise<VisaStatusesResponse> => {
  const endpoint = view === "in-progress" ? "in-progress" : "all";

  const res = await axiosInstance.get(`/hr/visa/${endpoint}`, {
    params: {
      keyword,
      page,
      limit: 5,
    },
  });

  return res.data;
};

export const getVisaStatusById = async (
  id: string
): Promise<VisaStatusDetailResponse> => {
  const res = await axiosInstance.get(`/hr/visa/${id}`);
  return res.data;
};

export const approveVisaDoc = async (
  id: string,
  documentType: string
) => {
  const res = await axiosInstance.put(
    `/hr/visa/${id}/documents/${documentType}/approve`
  );

  return res.data;
};

export const rejectVisaDoc = async (
  id: string,
  documentType: string,
  feedback: string
) => {
  const res = await axiosInstance.put(
    `/hr/visa/${id}/documents/${documentType}/reject`,
    { feedback }
  );

  return res.data;
};

export const sendVisaReminder = async (
  id: string,
  documentType: string
) => {
  const res = await axiosInstance.post(
    `/hr/visa/${id}/documents/${documentType}/remind`
  );

  return res.data;
};

export const sendVisaNextStepNotification = async (
  id: string,
  documentType: string
) => {
  const res = await axiosInstance.post(
    `/hr/visa/${id}/documents/${documentType}/notify-next`
  );

  return res.data;
};
