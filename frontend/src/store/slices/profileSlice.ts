import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance.ts';  


// Thunk 1 Get current employee's profile data
export const fetchProfile = createAsyncThunk(
    'profile/fetch', // action type, it's a redux id, so later can put on the three actions: P,F,R.
    async (_, {rejectWithValue}) => {
        try{
            const res = await api.get('/employee/profile');
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
            const res = await api.put('/employee/profile/address', addressData);
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
      const res = await api.put('/employee/profile/name', nameData);  
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
      const res = await api.put('/employee/profile/contact', contactData);  
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
      const res = await api.put('/employee/profile/employment', employmentData); 
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// Thunk 6: 
export const updateEmergencyContact = createAsyncThunk(
  'profile/updateEmergencyContact',
  async (emergencyData: any, { rejectWithValue }) => {
    try {
      const res = await api.put('/employee/profile/emergency', emergencyData);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);
// ── initialState define, clear the bug ──
interface ProfileState {
  data: any;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
};

// ======= slice: define teh states and my reducer's logic =======
const profileSlice = createSlice({
    name:'profile',
    initialState:{
        data: null as any,
        loading: false,
        error: null as string | null,
    },
    reducers: {}, // empty, cause the profile data comes from bacnkedGET, and stroed at state.data,no UI action needed.

    extraReducers: (builder) => {
      builder
        // ── fetchProfile ──
        .addCase(fetchProfile.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchProfile.fulfilled, (state, action) => {
          state.loading = false;
          state.data = action.payload;
        })
        .addCase(fetchProfile.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        })

        // ── updateAddress ──
        // 后端返回：{ message, address: employee.address }
        .addCase(updateAddress.fulfilled, (state, action) => {
          if (state.data) {
            state.data.address = action.payload.address;
          }
        })

        // ── updateName ──
        // 后端返回：{ message, data: { firstName, lastName, middleName, preferredName } }
        .addCase(updateName.fulfilled, (state, action) => {
          if (state.data) {
            const { firstName, lastName, middleName, preferredName, ssn, dateOfBirth, gender } = action.payload.data;
            state.data.firstName     = firstName;
            state.data.lastName      = lastName;
            state.data.middleName    = middleName;
            state.data.preferredName = preferredName;
            state.data.ssn           = ssn;
            state.data.dateOfBirth   = dateOfBirth;
            state.data.gender        = gender;
          }
        })

        // ── updateContact ──
        // 后端返回：{ message, data: { cellPhone, workPhone } }
        .addCase(updateContact.fulfilled, (state, action) => {
          if (state.data) {
            const { cellPhone, workPhone } = action.payload.data;
            state.data.cellPhone = cellPhone;
            state.data.workPhone = workPhone;
          }
        })

        // ── updateEmployment ──
        // 后端返回：{ message, data: { visaTitle, visaStart, visaEnd } }
        .addCase(updateEmployment.fulfilled, (state, action) => {
          if (state.data) {
            const { visaTitle, visaStart, visaEnd } = action.payload.data;
            state.data.visaTitle = visaTitle;
            state.data.visaStart = visaStart;
            state.data.visaEnd   = visaEnd;
          }
        })

        // ── updateEmergencyContact ──
        // 后端返回：{ message, emergencyContacts: employee.emergencyContacts }
        .addCase(updateEmergencyContact.fulfilled, (state, action) => {
          if (state.data) {
            state.data.emergencyContacts = action.payload.emergencyContacts;
          }
      });
  },
});

export default profileSlice.reducer;
