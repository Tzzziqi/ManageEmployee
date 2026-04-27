import axiosInstance from "../api/axiosInstance.ts";

const authService = {
    signup: async (inviteToken: string) => {
        const response = await axiosInstance.post(`/auth/register/${inviteToken}`);
        return response.data.data;
    }
}

export default authService;