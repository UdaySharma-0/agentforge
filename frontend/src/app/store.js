import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import agentReducer from "./agentSlice";
import workflowReducer from "./workflowSlice";
import logReducer from "./logSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    agents: agentReducer,
    workflows: workflowReducer,
    logs: logReducer,
  },
});
