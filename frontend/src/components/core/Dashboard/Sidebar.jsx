import { useState } from "react";
import { VscSignOut } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { sidebarLinks } from "../../../data/dashboard-links";
import { logout } from "../../../services/operations/authAPI";
import ConfirmationModal from "../../common/ConfirmationModal";
import SidebarLink from "./SidebarLink";
import { FaArrowRight } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import { RiArrowRightDoubleFill } from "react-icons/ri";
import { RiArrowLeftDoubleLine } from "react-icons/ri";
import useBreakpoint from "../../../hooks/useBreakPoint";
export default function Sidebar({ isMenuOpen, setIsMenuOpen }) {
  const { user, loading: profileLoading } = useSelector(
    (state) => state.profile
  );
  console.log("user: ", user);
  const { loading: authLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  // to keep track of confirmation modal
  const [confirmationModal, setConfirmationModal] = useState(null);

  console.log("breakpoint: ", breakpoint);
  if (profileLoading || authLoading) {
    return (
      <div className="grid h-[calc(100vh-3.5rem)] min-w-[220px] items-center border-r-[1px] border-r-richblack-700 bg-richblack-800 ">
        <div className="spinner"></div>
      </div>
    );
  }
  // ${
  //
  // }
  return (
    <>
      <div
        className={`${
          isMenuOpen
            ? "absolute w-full h-full z-10  bg-opacity-10 backdrop-blur-sm"
            : "hidden"
        }`}
      ></div>
      {/* */}
      {/* <button
        onClick={() => {
          setIsMenuOpen((prev) => !prev);
        }}
        className={`${
          isMenuOpen ? "left-[47%] top-[2.5rem]" : "left-[3%] top-[2.5rem]"
        } top-[25%] md:hidden absolute text-richblack-800 text-xs  
      rounded-2xl  bg-yellow-100 p-2
      z-20`}
      >
        {isMenuOpen ? (
          <RiArrowLeftDoubleLine />
        ) : (
          <FaArrowRight className=" " />
        )}
      </button> */}
      <div
        className={`${
          breakpoint === "sm"
            ? isMenuOpen
              ? "w-[220px] absolute "
              : "w-[50px] items-center"
            : ""
        }  md:static lg:min-w-[220px]   flex h-[calc(100vh-3.5rem)] 
      lg:w-[220px] flex-col  border-r-[1px] border-r-richblack-700
       bg-richblack-800 py-10 z-10 
       lg:z-0  transition-[width] duration-500`}
      >
        <button
          onClick={() => {
            setIsMenuOpen((prev) => !prev);
          }}
          className={` absolute ${
            isMenuOpen
              ? "right-[3%] p-3 text-md  top-7 "
              : "left-[3%] top-7 text-xs p-2"
          } top-[25%] md:hidden  text-richblack-800   
      rounded-2xl  bg-yellow-100 
      z-20`}
        >
          {isMenuOpen ? (
            <RiArrowLeftDoubleLine />
          ) : (
            <FaArrowRight className=" " />
          )}
        </button>
        <div className="flex flex-col gap-y-2 mt-[5.5rem] md:mt-0 md:gap-y-2">
          {sidebarLinks.map((link) => {
            if (link.type && user?.accountType !== link.type) return null;
            return (
              <SidebarLink
                setIsMenuOpen={setIsMenuOpen}
                isMenuOpen={isMenuOpen}
                key={link.id}
                link={link}
                iconName={link.icon}
              />
            );
          })}
        </div>
        <div className="mx-auto mt-6 mb-6 h-[1px] w-10/12 bg-richblack-700" />
        <div className="flex flex-col">
          <SidebarLink
            setIsMenuOpen={setIsMenuOpen}
            isMenuOpen={isMenuOpen}
            link={{ name: "Settings", path: "/dashboard/settings" }}
            iconName="VscSettingsGear"
          />
          <button
            onClick={() =>
              setConfirmationModal({
                text1: "Are you sure?",
                text2: "You will be logged out of your account.",
                btn1Text: "Logout",
                btn2Text: "Cancel",
                btn1Handler: () => dispatch(logout(navigate)),
                btn2Handler: () => setConfirmationModal(null),
              })
            }
            className="px-8 py-2 text-sm font-medium text-richblack-300"
          >
            <div className="flex items-center gap-x-2">
              <VscSignOut className="text-lg" />
              <span className={`${isMenuOpen ? "" : "hidden"} lg:flex `}>
                Logout
              </span>
            </div>
          </button>
        </div>
      </div>
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
}
