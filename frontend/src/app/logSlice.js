import { createSlice } from "@reduxjs/toolkit";

const logSlice = createSlice({
  name: "logs",
  initialState: {
    list: [],
  },
  reducers: {},
});

export default logSlice.reducer;
