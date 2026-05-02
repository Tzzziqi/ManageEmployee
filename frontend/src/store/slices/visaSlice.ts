import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance.ts';  

//=== thunk 1: fetch visa status===
export const fetchVisaStatus = createAsyncThunk(
    'visa/fetchStatus',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/employee/visa-status');
            return res.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

//===Thunk 2: upload file: Presigned URL-3 steps: temp url to frontend; send the file to S3; tell backend finished, and b only store a file address string.
export const uploadDocument = createAsyncThunk(
    'visa/uploadDocument',
    async ({ file, docType }: { file: File; docType: string }, { rejectWithValue }) => {
        try {
            const res = await api.post('/employee/documents/upload', file, {
                params: {
                    docType,
                    fileName: file.name
                },
                headers: {
                    'Content-Type': file.type || 'application/octet-stream'
                }
            });
            return res.data.document;

        } catch(error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
)
// ====== Slice 
const visaSlice = createSlice({
    name: 'visa',
    initialState: {
    data:      null as any,
    loading:   false,   // fetchVisaStatus's loading
    uploading: false,   // uploadDocument's loading
    error:     null as string | null
  },
  reducers: {},

  extraReducers:(builder) =>{
    builder
    // fetch visa status
    .addCase(fetchVisaStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
  })
    .addCase(fetchVisaStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
    })
    .addCase(fetchVisaStatus.rejected, (state, action) => {
    state.loading = false;
    state.error = (action.payload as string) || 'Failed to fetch visa status';
    })
    // uploadDocument
    .addCase(uploadDocument.pending, (state) =>{
        state.uploading = true;
    })
    .addCase(uploadDocument.fulfilled, (state) => {
        state.uploading = false;
    })
    .addCase(uploadDocument.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string; // store the error, and UI can display it. I defined at the initialState.
    });
  }
});

export default visaSlice.reducer;
