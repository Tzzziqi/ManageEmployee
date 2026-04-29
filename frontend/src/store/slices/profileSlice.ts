import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance.ts';  


// Thunk 1 Get current employee's profile data
export const fetchProfile = createAsyncThunk(
    'profile/fetch', // action type, it's a redux id, so later can put on the three actions: P,F,R.
    async (_, {rejectWithValue}) => {
        try{
            const res = await api.get('api/employee/profile');
            return res.data;
        } catch(error: any) {
            // rejectWithValue: manually control what gets stored on rejection
            // Request fails → use rejectWithValue, not throw. coz: throw stores non-serializable Error object → Redux DevTools warning
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

// Thunk 2 Update e's address info
export const updateAddress = createAsyncThunk(
    'profile/updateAddress',
    // any for now. need change to 'interface AddDTO later when confirm backend data structure'
    async (addressData: any, {rejectWithValue }) => {
        try {
            const res = await api.put('/api/employee/profile/address', addressData);
            return res.data;
        // can use any here, coz need it for access .response
        } catch(error: any) {
            return rejectWithValue(error.response?.data?.message);
        }    }
)

export const updateName = createAsyncThunk(
  'profile/updateName',                         
  async (nameData: any, { rejectWithValue }) => {
    try {
      const res = await api.put('/api/employee/profile/name', nameData);  
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const updateContact = createAsyncThunk(
  'profile/updateContact',                          
  async (contactData: any, { rejectWithValue }) => {
    try {
      const res = await api.put('/api/employee/profile/contact', contactData);  
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const updateEmployment = createAsyncThunk(
  'profile/updateEmployment',                          
  async (employmentData: any, { rejectWithValue }) => {
    try {
      const res = await api.put('/api/employee/profile/employment', employmentData); 
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ======= slice: define teh states and my reducer's logic =======
const profileSlice = createSlice({
    name:'profile',
    initialState:{
        data: null as any,
        loading: false,
        error: null as string | null,
    },
    reducers: {}, // empty, cause the profile data comes from bacnkedGET, and stroed at state.data,no UI action needed.
    extraReducers: (builder) =>{
        builder
        .addCase(fetchProfile.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data    = action.payload;   
        })
        .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
        })
        // this one is local update 
        .addCase(updateAddress.fulfilled, (state, action) => {
        if (state.data) {
          state.data.address = action.payload.address;
        }
      });
    }
});
export default profileSlice.reducer;
