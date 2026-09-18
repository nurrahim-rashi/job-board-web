import { useEffect } from "react";

const modalSelector =
  '[aria-modal="true"], .auth-modal, .admin-dialog, .experience-modal';

export function ModalScrollGuard() {
  useEffect(() => {
    let locked = false;
    let scrollY = 0;
    let previousBodyStyles: Record<string, string> | null = null;
    let previousOverscroll = "";

    const lock = () => {
      if (locked) return;

      locked = true;
      scrollY = window.scrollY;
      previousBodyStyles = {
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        top: document.body.style.top,
        width: document.body.style.width,
        paddingRight: document.body.style.paddingRight,
      };
      previousOverscroll = document.documentElement.style.overscrollBehavior;

      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      const bodyPaddingRight =
        Number.parseFloat(window.getComputedStyle(document.body).paddingRight) ||
        0;

      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${bodyPaddingRight + scrollbarWidth}px`;
      }
      document.documentElement.style.overscrollBehavior = "none";
    };

    const unlock = () => {
      if (!locked || !previousBodyStyles) return;

      locked = false;
      document.body.style.overflow = previousBodyStyles.overflow;
      document.body.style.position = previousBodyStyles.position;
      document.body.style.top = previousBodyStyles.top;
      document.body.style.width = previousBodyStyles.width;
      document.body.style.paddingRight = previousBodyStyles.paddingRight;
      document.documentElement.style.overscrollBehavior = previousOverscroll;
      window.scrollTo(0, scrollY);
      previousBodyStyles = null;
    };

    const sync = () => {
      if (document.querySelector(modalSelector)) lock();
      else unlock();
    };

    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    sync();

    return () => {
      observer.disconnect();
      unlock();
    };
  }, []);

  return null;
}
