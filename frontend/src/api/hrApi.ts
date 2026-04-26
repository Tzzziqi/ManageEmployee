import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/hr";

export interface OnboardingApplication {
  _id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  email: string;
  phone?: string;
  workAuthorization?: string;
  visaStartDate?: string;
  visaEndDate?: string;
  status: "pending" | "approved" | "rejected";
  feedback?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeSearchResponse {
  total: number;
  employees: OnboardingApplication[];
}

export const getAllApplications = async (): Promise<OnboardingApplication[]> => {
  const response = await axios.get(`${API_BASE_URL}/applications`);
  return response.data;
};

export const getApplicationsByStatus = async (
  status: "pending" | "approved" | "rejected"
): Promise<OnboardingApplication[]> => {
  const response = await axios.get(`${API_BASE_URL}/applications/status/${status}`);
  return response.data;
};

export const searchEmployeeProfiles = async (
  keyword: string
): Promise<EmployeeSearchResponse> => {
  const response = await axios.get(`${API_BASE_URL}/employees/search`, {
    params: { keyword },
  });

  return response.data;
};

export const approveApplication = async (
  id: string
): Promise<OnboardingApplication> => {
  const response = await axios.put(`${API_BASE_URL}/applications/${id}/approve`);
  return response.data.application;
};

export const rejectApplication = async (
  id: string,
  feedback: string
): Promise<OnboardingApplication> => {
  const response = await axios.put(`${API_BASE_URL}/applications/${id}/reject`, {
    feedback,
  });

  return response.data.application;
};