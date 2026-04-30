import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/hr";

export interface Onboarding {
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

export interface ApplicationsResponse {
  applications: Onboarding[];
  page: number;
  totalPages: number;
}

export interface EmployeeSearchResponse {
  total: number;
  employees: Onboarding[];
}

export const getAllApplications = async (
  page: number = 1
): Promise<ApplicationsResponse> => {
  const response = await axios.get(`${API_BASE_URL}/applications`, {
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
  const response = await axios.get(`${API_BASE_URL}/applications/status/${status}`, {
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
) => {
  const response = await axios.get(`${API_BASE_URL}/employees`, {
    params: {
      keyword,
      page,
      limit: 5,
    },
  });

  return response.data;
};

export const approveApplication = async (id: string): Promise<Onboarding> => {
  const response = await axios.put(`${API_BASE_URL}/applications/${id}/approve`);
  return response.data.application;
};

export const rejectApplication = async (
  id: string,
  feedback: string
): Promise<Onboarding> => {
  const response = await axios.put(`${API_BASE_URL}/applications/${id}/reject`, {
    feedback,
  });

  return response.data.application;
};