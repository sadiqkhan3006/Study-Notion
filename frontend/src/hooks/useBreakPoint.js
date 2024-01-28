import { useEffect, useState } from "react";
import { useMedia } from "react-use";

const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState("");
  const smallScreen = useMedia("(max-width: 640px)");
  const mediumScreen = useMedia("(min-width: 641px) and (max-width: 1024px)");
  const largeScreen = useMedia("(min-width: 1025px)");
  useEffect(() => {
    if (smallScreen) {
      setBreakpoint("sm");
    } else if (mediumScreen) {
      setBreakpoint("md");
    } else if (largeScreen) {
      setBreakpoint("lg");
    }
  }, []);

  return breakpoint;
};

export default useBreakpoint;
