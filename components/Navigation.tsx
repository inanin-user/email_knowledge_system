"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    title: "Email Case",
    description: "Knowledge Function",
    href: "/add-email-case",
    matchPaths: [
      "/email-case-dialog",
      "/add-email-case",
    ],
    icon: "✉",
  },
  {
    title: "Information Case",
    description: "Information Function",
    href: "/add-information-case",
    matchPaths: [
      "/information-case-dialog",
      "/add-information-case",
    ],
    icon: "▤",
  },
];

const ANIMATION_DURATION = 200;

export default function Navigation() {
  const pathname = usePathname();

  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const isActivePath = (paths: string[]) => {
    return paths.some(
      (path) =>
        pathname === path ||
        pathname.startsWith(`${path}/`)
    );
  };

  const openMenu = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }

    setIsMounted(true);
    setIsOpen(true);
  };

  const closeMenu = () => {
    if (!isMounted || !isOpen) return;

    setIsOpen(false);

    closeTimer.current = setTimeout(() => {
      setIsMounted(false);
      closeTimer.current = null;
    }, ANIMATION_DURATION * 2);
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
      }
    };
  }, []);

  // Close the menu when navigating to another page.
  useEffect(() => {
    if (isOpen) {
      closeMenu();
    }
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-surface shadow-sm">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6">

          {/* Application title */}
          <Link
            href="/email-case-dialog"
            className="text-lg font-semibold text-foreground"
          >
            K and I System
          </Link>

          {/* Hamburger and floating menu anchor */}
          <div className="relative flex items-center">

            {/* Hamburger button */}
            <button
              type="button"
              onClick={isOpen ? closeMenu : openMenu}
              aria-label={
                isOpen
                  ? "Close navigation"
                  : "Open navigation"
              }
              aria-expanded={isOpen}
              aria-controls="floating-navigation"
              className="relative z-[60] flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-selected/30"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                {isOpen ? (
                  <path d="M18 6 6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Floating navigation box */}
            {isMounted && (
              <div
                id="floating-navigation"
                className={`
                  absolute right-0 z-[60] w-72
                  rounded-xl border border-border
                  bg-surface p-2 shadow-2xl
                  ${isOpen
                    ? "navigation-scale-up"
                    : "navigation-scale-down"
                  }
                `}
                style={{
                    top: "calc(100% + 12px)",
                    transformOrigin: "top right",
                }}
              >
                <div className="px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Navigation
                  </p>
                </div>

                <div className="space-y-2">
                  {navigationItems.map((item) => {
                    const active = isActivePath(item.matchPaths);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMenu}
                        aria-current={active ? "page" : undefined}
                        className={`
                          flex items-center gap-3 rounded-lg
                          border px-4 py-3
                          transition-colors
                          ${
                            active
                              ? "border-selected bg-selected text-selected-foreground"
                              : "border-border bg-background text-foreground hover:border-selected hover:bg-surface-muted"
                          }
                        `}
                      >
                        <span
                          className="text-xl"
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold">
                            {item.title}
                          </p>

                          <p
                            className={`text-xs ${
                              active
                                ? "text-selected-foreground/80"
                                : "text-gray-500"
                            }`}
                          >
                            {item.description}
                          </p>
                        </div>

                        {active && (
                          <span className="ml-auto text-xs font-medium">
                            Current
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Grey background cover */}
      {isMounted && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMenu}
          className={`
            fixed inset-0 z-40
            bg-gray-300/80
            backdrop-blur-[1px]
            navigation-overlay
            ${isOpen ? "navigation-overlay-open" : "navigation-overlay-close"}
          `}
        />
      )}
    </>
  );
}