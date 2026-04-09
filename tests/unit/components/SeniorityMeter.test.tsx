import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SeniorityMeter from "@/components/analysis/SeniorityMeter";

// framer-motion uses animations that aren't supported in jsdom — stub them out
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    motion: {
      circle: (props: React.SVGProps<SVGCircleElement>) => <circle {...props} />,
      span: ({ children, style, className }: React.HTMLAttributes<HTMLSpanElement>) => (
        <span style={style} className={className}>{children}</span>
      ),
    },
    useMotionValue: (initial: number) => ({ get: () => initial, set: vi.fn() }),
    useTransform: (_mv: unknown, fn: (v: number) => string) => fn(0),
    animate: vi.fn(),
  };
});

describe("SeniorityMeter", () => {
  it("renders without crashing", () => {
    render(<SeniorityMeter score={50} level="Mid-Level" />);
    expect(screen.getByText("Mid-Level")).toBeInTheDocument();
  });

  it("displays the level label", () => {
    render(<SeniorityMeter score={80} level="Senior" />);
    expect(screen.getByText("Senior")).toBeInTheDocument();
  });

  it("displays Junior level label", () => {
    render(<SeniorityMeter score={20} level="Junior" />);
    expect(screen.getByText("Junior")).toBeInTheDocument();
  });

  it("displays Expert level label", () => {
    render(<SeniorityMeter score={95} level="Expert" />);
    expect(screen.getByText("Expert")).toBeInTheDocument();
  });

  it("renders the /100 indicator", () => {
    render(<SeniorityMeter score={60} level="Mid-Level" />);
    expect(screen.getByText("/ 100")).toBeInTheDocument();
  });

  it("applies blue color for Junior score (< 40)", () => {
    const { container } = render(<SeniorityMeter score={20} level="Junior" />);
    const badge = screen.getByText("Junior");
    // Color is applied via inline style
    expect(badge).toHaveStyle({ color: "#2453D3" });
    expect(container).toBeTruthy();
  });

  it("applies orange color for Mid-Level score (40–69)", () => {
    render(<SeniorityMeter score={50} level="Mid-Level" />);
    const badge = screen.getByText("Mid-Level");
    expect(badge).toHaveStyle({ color: "#F59E0B" });
  });

  it("applies green color for Senior score (>= 70)", () => {
    render(<SeniorityMeter score={75} level="Senior" />);
    const badge = screen.getByText("Senior");
    expect(badge).toHaveStyle({ color: "#10B981" });
  });
});
