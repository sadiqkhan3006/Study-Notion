import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

const initialState = {
  totalItems: localStorage.getItem("totalItems")
    ? JSON.parse(localStorage.getItem("totalItems"))
    : 0,
  cart: localStorage.getItem("cart")
    ? JSON.parse(localStorage.getItem("cart"))
    : [],
  totalPrice: localStorage.getItem("totalPrice")
    ? JSON.parse(localStorage.getItem("totalPrice"))
    : 0,
};
export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      //   const course = action.payload;
      //   //check course exist in cart //
      //   const existingCourse = state.cart.filter(
      //     (eachCourse) => eachCourse._id === course._id
      //   );

      //   if (existingCourse.length > 0) {
      //     toast.error("Course already in cart");
      //     return state;
      //   }
      //   // if course not present then add course in cart //
      //   state.cart.push(course);
      //   state.totalItems++;
      //   state.totalPrice += course.price;
      //   localStorage.setItem("cart", JSON.stringify(state.cart));
      //   localStorage.setItem("totalItems", JSON.stringify(state.totalItems));
      //   localStorage.setItem("totalPrice", JSON.stringify(state.totalPrice));
      //   toast.success("Course added to cart");

      const course = action.payload;

      // Check if the course already exists in the cart
      const existingCourse = state.cart.find(
        (eachCourse) => eachCourse._id === course._id
      );

      if (existingCourse) {
        toast.error("Course already in cart");
        return state;
      }

      // If the course is not present, create a new state with the updated cart
      const updatedCart = [...state.cart, course];

      // Update localStorage
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      localStorage.setItem("totalItems", JSON.stringify(state.totalItems + 1));
      localStorage.setItem(
        "totalPrice",
        JSON.stringify(state.totalPrice + course.price)
      );
      toast.success("Course added to cart");
      // Create and return a new state object
      //best practise
      return {
        ...state,
        cart: updatedCart,
        totalItems: state.totalItems + 1,
        totalPrice: state.totalPrice + course.price,
      };
    },
    removeFromCart: (state, action) => {
      const courseid = action.payload;

      // Check if the course is in the cart
      const existingCourse = state.cart.find(
        (eachCourse) => eachCourse._id === courseid
      );

      if (existingCourse) {
        // Update state
        state.totalItems--;
        state.totalPrice -= existingCourse.price;

        // Remove the course from the cart
        const updatedCart = state.cart.filter(
          (eachCourse) => eachCourse._id !== courseid
        );

        // Update the state with the new cart
        state.cart = updatedCart;

        // Update local storage
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        localStorage.setItem("totalItems", JSON.stringify(state.totalItems));
        localStorage.setItem("totalPrice", JSON.stringify(state.totalPrice));

        toast.success("Course removed from cart");
      } else {
        toast.error("Course is not added to the cart");
      }

      return state;
    },
    resetCart: (state, action) => {
      const updatedCart = [];
      const totalItems = 0;
      const totalPrice = 0;
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      localStorage.setItem("totalItems", JSON.stringify(totalItems));
      localStorage.setItem("totalPrice", JSON.stringify(totalPrice));
      toast.success("Cart reset successfull.");
      return {
        ...state,
        cart: updatedCart,
        totalItems,
        totalPrice,
      };
    },
  },
});
export const { addToCart, removeFromCart, resetCart } = cartSlice.actions;
export default cartSlice.reducer;
