import axiosInstance from "../api/axiosInstance.ts";

export interface SignUpProps {
    inviteToken: string;
    userData: {
        username: string;
        password: string;
    };
}

const authService = {
    signup: async (props: SignUpProps) => {
        const response = await axiosInstance.post(`/auth/register/${props.inviteToken}`, props.userData);
        return response.data.data;
    }
}

export default authService;