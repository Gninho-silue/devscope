import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchForm from "@/components/home/SearchForm";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("SearchForm", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders the input and submit button", () => {
    render(<SearchForm />);
    expect(screen.getByRole("textbox", { name: /github username/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /analyze/i })).toBeInTheDocument();
  });

  it("shows an error when submitting with empty input", async () => {
    const user = userEvent.setup();
    render(<SearchForm />);

    await user.click(screen.getByRole("button", { name: /analyze/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/please enter a github username/i);
  });

  it("does not navigate when input is empty", async () => {
    const user = userEvent.setup();
    render(<SearchForm />);

    await user.click(screen.getByRole("button", { name: /analyze/i }));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("calls router.push with the correct path on valid submit", async () => {
    const user = userEvent.setup();
    render(<SearchForm />);

    await user.type(screen.getByRole("textbox", { name: /github username/i }), "torvalds");
    await user.click(screen.getByRole("button", { name: /analyze/i }));

    expect(mockPush).toHaveBeenCalledWith("/analyze/torvalds");
  });

  it("trims whitespace from username before navigating", async () => {
    const user = userEvent.setup();
    render(<SearchForm />);

    await user.type(screen.getByRole("textbox", { name: /github username/i }), "  torvalds  ");
    await user.click(screen.getByRole("button", { name: /analyze/i }));

    expect(mockPush).toHaveBeenCalledWith("/analyze/torvalds");
  });

  it("shows an error for an invalid username format", async () => {
    const user = userEvent.setup();
    render(<SearchForm />);

    await user.type(screen.getByRole("textbox", { name: /github username/i }), "invalid username!");
    await user.click(screen.getByRole("button", { name: /analyze/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
