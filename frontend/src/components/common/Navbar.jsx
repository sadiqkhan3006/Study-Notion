import React, { useEffect, useState } from "react";
import logo from "../../assets/Logo/Logo-Full-Light.png";
import { Link, useLocation, matchPath } from "react-router-dom";
import { NavbarLinks } from "../../data/navbar-links";
import { useSelector } from "react-redux";
//import { AiOutlineShoppingCart } from "react-icons/ai";
import { AiOutlineMenu, AiOutlineShoppingCart } from "react-icons/ai";
import ProfileDropDown from "../core/Auth/ProfileDropDown";
import { apiConnector } from "../../services/apiconnector";
import { categories } from "../../services/apis";
import { IoIosArrowDropdownCircle } from "react-icons/io";
import { BsChevronDown } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { ACCOUNT_TYPE } from "../../utils/constants";
export const Navbar = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  //console.log("user:", user);
  const { totalItems } = useSelector((state) => state.cart);
  const [loading, setLoading] = useState(false);
  //console.log("cartItem ", totalItems);
  const location = useLocation();
  const [subLinks, setSublinks] = useState([]);
  const [toggleMobileMenu, setToggleMobileMenu] = useState(false);
  const [isCatlogActive, setCatlogActive] = useState(false);
  console.log(isCatlogActive);
  console.log("sublinks : ", subLinks);
  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };
  const fetchSublinks = async () => {
    try {
      const result = await apiConnector("GET", categories.CATEGORIES_API);
      //console.log("Printing Sublinks:", result.data.data);
      setSublinks(result.data.data);
    } catch (err) {
      console.log("catlogApi error : ", err.message);
    }
  };
  useEffect(() => {
    fetchSublinks();
  }, []);
  return (
    <div
      className={` flex h-14  items-center justify-center border-b-[1px] border-b-richblack-700 ${
        location.pathname !== "/" ? "bg-richblack-700" : "bg-richblack-700"
      } transition-all duration-200`}
    >
      <div className="flex w-11/12 max-w-maxContent items-center justify-between ">
        {/* Logo */}
        <Link to="/">
          <img src={logo} alt="Logo" width={160} height={32} loading="lazy" />
        </Link>

        {/* for mobile Styling */}
        <div
          // top-[-13rem] left-[25rem]
          className={`${
            toggleMobileMenu ? "top-[3.5rem]" : "top-[-23rem] "
          } absolute bg-richblack-700 lg:hidden w-screen  z-20  left-0 
          text-richblack-25 flex flex-col transition-top ease-linear  duration-200`}
        >
          <ul className="  text-richblack-25 flex flex-col items-center gap-y-5 p-5 ">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <>
                    <div
                      onClick={() => {
                        setCatlogActive((prev) => !prev);
                      }}
                      className={`group relative flex cursor-pointer items-center gap-1 ${
                        matchRoute("/catalog/:catalogName")
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      <p>{link.title}</p>
                      <BsChevronDown />
                      <div
                        className={`${
                          isCatlogActive
                            ? "visible opacity-100 translate-y-[1.65em]"
                            : "invisible opacity-0"
                        } absolute left-[120%] top-[0%] z-[1000] 
                      flex w-[200px] translate-x-[-50%] 
                      translate-y-[3em] flex-col rounded-lg
                       bg-richblack-5 p-4 text-richblack-900  transition-all 
                       duration-150   
                        lg:w-[300px]  `}
                      >
                        <div className="absolute left-[20%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                        {loading ? (
                          <p className="text-center">Loading...</p>
                        ) : subLinks.length > 0 ? (
                          <>
                            {subLinks
                              ?.filter(
                                (subLink) => subLink?.courses?.length > 0
                              )
                              ?.map((subLink, i) => (
                                <Link
                                  onClick={() => {
                                    setToggleMobileMenu((prev) => !prev);
                                  }}
                                  to={`/catalog/${subLink.name
                                    .split(" ")
                                    .join("-")
                                    .toLowerCase()}`}
                                  className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50"
                                  key={i}
                                >
                                  <p>{subLink.name}</p>
                                </Link>
                              ))}
                          </>
                        ) : (
                          <p className="text-center">No Courses Found</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    onClick={() => {
                      setToggleMobileMenu((prev) => !prev);
                    }}
                    to={link?.path}
                  >
                    <p
                      className={`${
                        matchRoute(link?.path)
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
          {/* Login / Signup / Dashboard */}
          <div className="flex flex-col items-center gap-y-5 p-5 ">
            {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
              <Link to="/dashboard/cart" className="relative">
                <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
                {totalItems > 0 && (
                  <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            {token === null && (
              <Link to="/login">
                <button
                  onClick={() => {
                    setToggleMobileMenu((prev) => !prev);
                    setCatlogActive(false);
                  }}
                  className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100"
                >
                  Log in
                </button>
              </Link>
            )}
            {token === null && (
              <Link to="/signup">
                <button
                  onClick={() => {
                    setToggleMobileMenu((prev) => !prev);
                    setCatlogActive(false);
                  }}
                  className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100"
                >
                  Sign up
                </button>
              </Link>
            )}
            {token !== null && <ProfileDropDown />}
          </div>
        </div>

        {/* for laptop */}
        {/* Navigation links */}
        <nav className={`hidden lg:block`}>
          <ul className="lg:flex lg:flex-row lg:gap-x-6 text-richblack-25 flex flex-col ">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <>
                    <div
                      className={`group relative flex cursor-pointer items-center gap-1 ${
                        matchRoute("/catalog/:catalogName")
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      <p>{link.title}</p>
                      <BsChevronDown />
                      <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]">
                        <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                        {loading ? (
                          <p className="text-center">Loading...</p>
                        ) : subLinks.length > 0 ? (
                          <>
                            {subLinks
                              ?.filter(
                                (subLink) => subLink?.courses?.length > 0
                              )
                              ?.map((subLink, i) => (
                                <Link
                                  to={`/catalog/${subLink.name
                                    .split(" ")
                                    .join("-")
                                    .toLowerCase()}`}
                                  className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50"
                                  key={i}
                                >
                                  <p>{subLink.name}</p>
                                </Link>
                              ))}
                          </>
                        ) : (
                          <p className="text-center">No Courses Found</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link to={link?.path}>
                    <p
                      className={`${
                        matchRoute(link?.path)
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Login / Signup / Dashboard */}
        <div className="hidden items-center gap-x-4 lg:flex">
          {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="relative">
              <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
              {totalItems > 0 && (
                <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
          {token === null && (
            <Link to="/login">
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                Log in
              </button>
            </Link>
          )}
          {token === null && (
            <Link to="/signup">
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                Sign up
              </button>
            </Link>
          )}
          {token !== null && <ProfileDropDown />}
        </div>
        <button
          className="mr-4 lg:hidden"
          onClick={() => {
            setToggleMobileMenu((prev) => !prev);
            setCatlogActive(false);
          }}
        >
          {toggleMobileMenu ? (
            <RxCross1 fontSize={24} className="text-white " />
          ) : (
            <AiOutlineMenu fontSize={24} fill="#AFB2BF" />
          )}
        </button>
      </div>
    </div>
  );
};
