import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import inviteService from "../../services/inviteService";

export const validateInvite = createAsyncThunk(
    'auth/validateInvite',
    async (inviteToken: string, thunkAPI) => {
        try {
            return await inviteService.validateInvite(inviteToken);
        } catch (error) {
            let message;
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || error.message || 'Unknown error';
            }
            return thunkAPI.rejectWithValue(message);
        }
    }
)

interface InviteState {
    isVerified: boolean;
    status: string;
    error: string;
}

const initialState: InviteState = {
    isVerified: false,
    status: 'idle',
    error: ''
}

const inviteSlice = createSlice({
    name: 'invite',
    initialState,
    reducers: {
        resetInvite: () => { return initialState; }
    },
    extraReducers: (builder) => {
        builder
            .addCase(validateInvite.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(validateInvite.fulfilled, (state) => {
                state.status = 'succeeded';
                state.isVerified = true;
            })
            .addCase(validateInvite.rejected, (state, action) => {
                state.status = 'failed';
                state.isVerified = false;
                state.error = action.payload as string;
            })
    }
})

export const { resetInvite } = inviteSlice.actions;
export default inviteSlice.reducer;