import { createSlice } from "@reduxjs/toolkit";

const workflowSlice = createSlice({
  name: "workflows",
  initialState: {
    current: null,
  },
  reducers: {},
});

export default workflowSlice.reducer;
