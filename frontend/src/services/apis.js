//import dotenv from "dotenv";
//dotenv.config();
const BASE_URL = process.env.REACT_APP_BASE_URL;
//const BASE_URL = "http://localhost:3000/";
export const categories = {
  CATEGORIES_API: BASE_URL + "/course/showAllCategories",
};
// /api/v1/
