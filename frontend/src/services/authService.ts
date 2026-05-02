import axiosInstance from "../api/axiosInstance.ts";

export interface SignUpProps {
    inviteToken: string;
    userData: {
        username: string;
        password: string;
    };
}

export interface SignInProps {
    username: string;
    password: string;
}

const normalizeAuthData = (data: any) => ({
    token: data?.token || null,
    username: data?.username || data?.user?.username || null,
    email: data?.email || data?.user?.email || null,
    role: data?.role || data?.user?.role || null,
});

const authService = {
    signup: async (props: SignUpProps) => {
        const response = await axiosInstance.post(`/auth/register/${props.inviteToken}`, props.userData);
        return normalizeAuthData(response.data.data);
    },
    signIn: async (props: SignInProps) => {
        const response = await axiosInstance.post('/auth/signIn', props);
        return normalizeAuthData(response.data.data);
    }
}

export default authService;
