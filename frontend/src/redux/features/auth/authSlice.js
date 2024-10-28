import { createSlice } from "@reduxjs/toolkit";

// TODO: Get the current expirationTime and set it again if there is not any other remember option


const initialState = (() => {
  const userInfo = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null;
  const expirationTime = localStorage.getItem("expirationTime")
    ? JSON.parse(localStorage.getItem("expirationTime"))
    : null;

  // Check if the expirationTime is less than the current time
  if (expirationTime) {
    const expirationDate = new Date(expirationTime);
    if (new Date().getTime() > expirationDate.getTime()) {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("expirationTime");
      return {
        userInfo: null,
        expirationTime: null,
      };
    }
  }

  return {
    userInfo,
    expirationTime,
  };
})();

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const duration = action.payload.remember ? 30 : 1;
      const expirationTime =
        new Date().getTime() + 24 * 60 * 60 * 1000 * duration;
      state.userInfo = action.payload.user;
      state.expirationTime = expirationTime;
      localStorage.setItem("userInfo", JSON.stringify(action.payload.user));
      localStorage.setItem("expirationTime", expirationTime);
    },
    removeCredentials: (state) => {
      state.userInfo = null;
      localStorage.removeItem("userInfo");
      localStorage.removeItem("expirationTime");
    },
  },
});

export const { setCredentials, removeCredentials } = authSlice.actions;
export default authSlice.reducer;
