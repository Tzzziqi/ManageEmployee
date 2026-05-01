import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import authService, { type SignUpProps } from "../../services/authService";

export const signup = createAsyncThunk(
  "auth/signup",
  async (props: SignUpProps, thunkAPI) => {
    try {
      return await authService.signup(props);
    } catch (error) {
      let message = "Unknown error";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message || "Unknown error";
      }

      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  username: null as string | null,
  role: localStorage.getItem("role") || null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  status: "idle",
  error: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.username = null;
      state.role = null;
      state.token = null;
      state.isAuthenticated = false;

      localStorage.removeItem("token");
      localStorage.removeItem("role");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.status = "loading";
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.username = action.payload.username;
        state.role = action.payload.role;
        state.token = action.payload.token;
        state.isAuthenticated = true;

        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("role", action.payload.role);
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;