import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import authService from "../../services/authService";

export const signup = createAsyncThunk(
    'auth/signup',
    async (inviteToken: string, thunkAPI) => {
        try {
            return await authService.signup(inviteToken);
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
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    status: 'idle',
    error: '',
}

const inviteSlice = createSlice({
    name: 'invite',
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
            })
            .addCase(signup.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(signup.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
    }
})

export const { logout } = inviteSlice.actions;
export default inviteSlice.reducer;