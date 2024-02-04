import * as Icons from "react-icons/vsc";
import { useDispatch } from "react-redux";
import { NavLink, matchPath, useLocation } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { resetCourseState } from "../../../slices/courseSlice";
import useBreakpoint from "../../../hooks/useBreakPoint";
export default function SidebarLink({
  setIsMenuOpen,
  isMenuOpen,
  link,
  iconName,
}) {
  //console.log("inside Sublink: ", Icons);
  const Icon = Icons[iconName] ? Icons[iconName] : FiShoppingCart;
  const location = useLocation();
  const dispatch = useDispatch();
  const breakpoint = useBreakpoint();
  //konsa path highlight karwana hai
  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  return (
    <NavLink
      to={link.path}
      onClick={() => {
        dispatch(resetCourseState());
        setIsMenuOpen(false);
      }}
      className={`${
        breakpoint === "sm" ? (isMenuOpen ? "" : "bg-opacity-0") : ""
      } relative px-8 py-2 text-sm font-medium  ${
        matchRoute(link.path)
          ? "bg-yellow-800 text-yellow-50"
          : "bg-opacity-0 text-richblack-300"
      }  `}
    >
      <span
        className={`hidden lg:flex absolute left-0 top-0 h-full w-[0.15rem] bg-yellow-50 ${
          matchRoute(link.path) ? "opacity-100" : "opacity-0"
        }`}
      ></span>
      <div className="flex items-center gap-x-2 transition-[display] duration-500 delay-1000 ">
        {/* Icon Goes Here */}
        <Icon className="text-lg" />
        <span className={`${isMenuOpen ? "flex" : "hidden"} lg:flex `}>
          {link.name}
        </span>
      </div>
    </NavLink>
  );
}
