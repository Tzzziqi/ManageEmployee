import axiosInstance from "../api/axiosInstance.ts";

const inviteTokenService = {
    getInvites: async () => {
        const response = await axiosInstance.get('/invites');
        return response;
    },
    revokeInvites: async (id: string) => {
        const response = await axiosInstance.patch(`/invites/${id}/revoke`);
        return response;
    },
    generateInvite: async (data: { email: string; role: string }) => {
        const response = await axiosInstance.post('/invites/generate', data);
        return response.data;
    }
}

export default inviteTokenService;