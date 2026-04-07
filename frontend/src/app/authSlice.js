import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getCurrentUser,
  loginApi,
  loginWithGoogle,
} from "../services/authService";

const TOKEN_STORAGE_KEY = "token";

function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function persistToken(token) {
  if (typeof window === "undefined") return;

  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    return;
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

const initialState = {
  token: getStoredToken(),
  user: null,
  isAuthenticated: false,
  isBootstrapping: true,
  loading: false,
  error: null,
};

export const restoreAuth = createAsyncThunk(
  "auth/restoreAuth",
  async (_, { rejectWithValue }) => {
    const token = getStoredToken();

    if (!token) {
      return { token: null, user: null };
    }

    try {
      const response = await getCurrentUser();
      return {
        token,
        user: response.user,
      };
    } catch (error) {
      persistToken(null);
      return rejectWithValue(error.message || "Unable to restore session");
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginApi(credentials);
      persistToken(response.token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  },
);

export const loginWithGoogleUser = createAsyncThunk(
  "auth/loginWithGoogleUser",
  async (credential, { rejectWithValue }) => {
    try {
      const response = await loginWithGoogle(credential);
      persistToken(response.token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Google login failed");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateAuthUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = Boolean(state.token && state.user);
    },
    logout(state) {
      persistToken(null);
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isBootstrapping = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreAuth.pending, (state) => {
        state.isBootstrapping = true;
        state.error = null;
      })
      .addCase(restoreAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = Boolean(action.payload.token && action.payload.user);
        state.isBootstrapping = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(restoreAuth.rejected, (state, action) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.isBootstrapping = false;
        state.loading = false;
        state.error = action.payload || action.error.message || null;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isBootstrapping = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload || action.error.message || "Login failed";
      })
      .addCase(loginWithGoogleUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogleUser.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isBootstrapping = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginWithGoogleUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error =
          action.payload || action.error.message || "Google login failed";
      });
  },
});

export const { updateAuthUser, logout } = authSlice.actions;
export default authSlice.reducer;
