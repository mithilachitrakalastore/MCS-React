import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there is no hash (#section-id), scroll to top
    if (!hash) {
      window.scrollTo(0, 0);
    } else {
      // If there IS a hash, find that element and scroll to it
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [pathname, hash]); // Trigger whenever the path or hash changes

  return null;
} 
