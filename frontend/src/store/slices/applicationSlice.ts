import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import applicationService from "../../services/applicationService.ts";
import axios from "axios";
import { signIn, signup } from "./authSlice.ts";

export const getApplication = createAsyncThunk(
    'auth/getApplication',
    async (_, thunkAPI) => {
        try {
            return await applicationService.getApplication();
        } catch (error) {
            let message;
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || error.message || 'Unknown error';
            }
            return thunkAPI.rejectWithValue(message);
        }
    }
)

const initialState = {
    username: null,
    email: null,
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
            state.username = null;
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
                state.username = action.payload.username;
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
                state.username = action.payload.username;
                state.email = action.payload.email;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                localStorage.setItem('token', action.payload.token);
            })
            .addCase(signIn.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
    }
})

export const { logout } = authSlice.actions;
export default authSlice.reducer;