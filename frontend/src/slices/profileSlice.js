import { createSlice } from "@reduxjs/toolkit";
const userTest = {
  _id: {
    $oid: "653378567516b28ab07c582a",
  },
  firstName: "Shariq",
  lastName: "Khan",
  email: "mohdshariq2101@gmail.com",
  password: "$2b$10$XWi7cz7O4VRXYt4J24hHVeBQ6s4JlZT..CNVQqkn/WvbQa50T6ARu",
  accountType: "Student",
  active: true,
  approved: true,
  additionalDetails: {
    $oid: "653378567516b28ab07c5828",
  },
  courses: [
    {
      $oid: "65337bafe586d1f6ac42e3de",
    },
  ],
  image: "https://api.dicebear.com/5.x/initials/svg?seed=Shariq Khan",
  courseProgress: [],
  __v: 0,
};
const initialState = {
  user: null,
};
export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});
export const { setUser } = profileSlice.actions;
export default profileSlice.reducer;
