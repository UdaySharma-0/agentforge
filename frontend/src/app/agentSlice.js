import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createAgent,
  deleteAgent,
  getAgentById,
  getAgents,
  updateAgent,
} from "../services/agentService";

export const fetchAgents = createAsyncThunk(
  "agents/fetchAgents",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAgents();
      return data.agents || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchAgentById = createAsyncThunk(
  "agents/fetchAgentById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await getAgentById(id);
      return data.agent;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createAgentAction = createAsyncThunk(
  "agents/createAgent",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createAgent(payload);
      return data.agent;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateAgentAction = createAsyncThunk(
  "agents/updateAgent",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const data = await updateAgent(id, payload);
      return data.agent;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteAgentAction = createAsyncThunk(
  "agents/deleteAgent",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAgent(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const agentSlice = createSlice({
  name: "agents",
  initialState: {
    list: [],
    selectedAgent: null,
    listLoading: false,
    detailLoading: false,
    submitLoading: false,
    deleteLoading: false,
    error: null,
  },
  reducers: {
    clearSelectedAgent: (state) => {
      state.selectedAgent = null;
    },
    clearAgentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgents.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload || "Failed to fetch agents";
      })
      .addCase(fetchAgentById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
        state.selectedAgent = null;
      })
      .addCase(fetchAgentById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedAgent = action.payload;
      })
      .addCase(fetchAgentById.rejected, (state, action) => {
        state.detailLoading = false;
        state.selectedAgent = null;
        state.error = action.payload || "Failed to load agent";
      })
      .addCase(createAgentAction.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
      })
      .addCase(createAgentAction.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.list = [action.payload, ...state.list];
        state.selectedAgent = action.payload;
      })
      .addCase(createAgentAction.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to create agent";
      })
      .addCase(updateAgentAction.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
      })
      .addCase(updateAgentAction.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.selectedAgent = action.payload;
        state.list = state.list.map((agent) =>
          agent._id === action.payload._id ? action.payload : agent,
        );
      })
      .addCase(updateAgentAction.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to update agent";
      })
      .addCase(deleteAgentAction.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteAgentAction.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.list = state.list.filter((agent) => agent._id !== action.payload);

        if (state.selectedAgent?._id === action.payload) {
          state.selectedAgent = null;
        }
      })
      .addCase(deleteAgentAction.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload || "Failed to delete agent";
      });
  },
});

export const { clearSelectedAgent, clearAgentError } = agentSlice.actions;

export default agentSlice.reducer;
