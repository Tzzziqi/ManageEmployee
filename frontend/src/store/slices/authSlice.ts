import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import authService, { type SignInProps, type SignUpProps } from "../../services/authService";

interface AuthState {
    username: string;
    id: string;
    email: string;
    role: "employee" | "hr" | "";
    token: string | null;
    isAuthenticated: boolean;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string;
}

export const signup = createAsyncThunk(
    'auth/signup',
    async (props: SignUpProps, thunkAPI) => {
        try {
            return await authService.signup(props);
        } catch (error) {
            let message;
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || error.message || 'Unknown error';
            }
            return thunkAPI.rejectWithValue(message);
        }
    }
)

export const signIn = createAsyncThunk(
    'auth/signIn',
    async (props: SignInProps, thunkAPI) => {
        try {
            return await authService.signIn(props);
        } catch (error) {
            let message;
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || error.message || 'Unknown error';
            }
            return thunkAPI.rejectWithValue(message);
        }
    }
)

const initialState: AuthState = {
    username: '',
    id: '',
    email: '',
    role: '',
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    status: 'idle',
    error: '',
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.username = '';
            state.email = '';
            state.id = '';
            state.role = '';
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(signup.pending, (state) => {
                state.status = 'loading';
                state.error = '';
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.username = action.payload.username || '';
                state.email = action.payload.email || '';
                state.role = action.payload.role || '';
                state.token = action.payload.token;
                state.isAuthenticated = !!action.payload.token;
                if (action.payload.token) {
                    localStorage.setItem('token', action.payload.token);
                }
            })
            .addCase(signup.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(signIn.pending, (state) => {
                state.status = 'loading';
                state.error = '';
            })
            .addCase(signIn.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.username = action.payload.username || '';
                state.email = action.payload.email || '';
                state.token = action.payload.token;
                state.id = action.payload.id || '';
                state.role = action.payload.role || '';
                state.isAuthenticated = !!action.payload.token;
                if (action.payload.token) {
                    localStorage.setItem('token', action.payload.token);
                }
            })
            .addCase(signIn.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
    }
})

export const { logout } = authSlice.actions;
export default authSlice.reducer;
