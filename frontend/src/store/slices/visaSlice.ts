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
            const { data } = await api.post('/employee/documents/upload-url', {
                fileType: file.type, // pdf o word etc.
                docType // e.g opt eda or i20 etc.
            });
            // step 2: PUT file to S3, use Fetch coz teh req is sent to S3 not our backend.
            await fetch(data.uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {'Content-Type': file.type}
            });
            // step3: tell backend the file is uploaded and ready for processing, so backend can update the document status to 'pending review' and store the file URL for future access.
            await api.post('/employee/documents/confirm', {
                fileKey: data.fileKey,
                docType
            });
            return docType; //tell which file has been uploaded/

        } catch(error: any) {
            // used fetch so no err.response only .message. 
            return rejectWithValue(error.message);
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
