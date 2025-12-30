import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import React from "react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => {
  // Props to filter out from motion components
  const motionProps = [
    "whileHover",
    "whileTap",
    "whileFocus",
    "whileDrag",
    "whileInView",
    "initial",
    "animate",
    "exit",
    "transition",
    "variants",
    "layout",
    "layoutId",
  ];

  const createMockComponent = (tag: string) => {
    return React.forwardRef(({ children, ...props }: any, ref: any) => {
      // Filter out motion-specific props
      const filteredProps = Object.fromEntries(
        Object.entries(props).filter(([key]) => !motionProps.includes(key))
      );
      return React.createElement(tag, { ...filteredProps, ref }, children);
    });
  };

  return {
    motion: {
      div: createMockComponent("div"),
      button: createMockComponent("button"),
      h3: createMockComponent("h3"),
      span: createMockComponent("span"),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
}));
