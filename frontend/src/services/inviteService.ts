import axiosInstance from "../api/axiosInstance.ts";

const inviteService = {
    validateInvite: async (inviteToken: string) => {
        const response = await axiosInstance.get(`/auth/validateInvite/${inviteToken}`);
        return response.data.data;
    }
}

export default inviteService;