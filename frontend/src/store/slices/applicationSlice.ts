import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import applicationService, {
    type applicationRequest,
    type S3PresignedUrlRequest
} from "../../services/applicationService.ts";
import axios from "axios";

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

export const getS3PresignedUrl = createAsyncThunk(
    'auth/getS3PresignedUrl',
    async (props: S3PresignedUrlRequest, thunkAPI) => {
        try {
            return await applicationService.getS3PresignedUrl(props);
        } catch (error) {
            let message;
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || error.message || 'Unknown error';
            }
            return thunkAPI.rejectWithValue(message);
        }
    }
)

export const submitApplication = createAsyncThunk(
    'auth/submitApplication',
    async (applicationData: applicationRequest, thunkAPI) => {
        try {
            return await applicationService.submitApplication(applicationData);
        } catch (error) {
            let message;
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || error.message || 'Unknown error';
            }
            return thunkAPI.rejectWithValue(message);
        }
    }
)

export const updateApplication = createAsyncThunk(
    'auth/updateApplication',
    async (applicationData: applicationRequest, thunkAPI) => {
        try {
            return await applicationService.updateApplication(applicationData);
        } catch (error) {
            let message;
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || error.message || 'Unknown error';
            }
            return thunkAPI.rejectWithValue(message);
        }
    }
)

interface ApplicationState {
    applicationData: applicationRequest | null;
    presignedUrl: {
        uploadUrl: string;
        fileUrl: string;
        s3Key: string;
    } | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: ApplicationState = {
    applicationData: null,
    presignedUrl: null,
    status: 'idle',
    error: '',
}

const applicationSlice = createSlice({
    name: 'application',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(getApplication.pending, (state) => {
                state.status = 'loading';
                state.error = '';
            })
            .addCase(getApplication.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.applicationData = action.payload.applicationData;
            })
            .addCase(getApplication.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(getS3PresignedUrl.pending, (state) => {
                state.status = 'loading';
                state.error = '';
                state.presignedUrl = null;
            })
            .addCase(getS3PresignedUrl.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.presignedUrl = action.payload.uploadUrl;
            })
            .addCase(getS3PresignedUrl.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(submitApplication.pending, (state) => {
                state.status = 'loading';
                state.error = '';
                state.presignedUrl = null;
            })
            .addCase(submitApplication.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.applicationData = action.payload.applicationData;
            })
            .addCase(submitApplication.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(updateApplication.pending, (state) => {
                state.status = 'loading';
                state.error = '';
                state.presignedUrl = null;
            })
            .addCase(updateApplication.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.applicationData = action.payload.applicationData;
            })
            .addCase(updateApplication.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
    }
})

export default applicationSlice.reducer;