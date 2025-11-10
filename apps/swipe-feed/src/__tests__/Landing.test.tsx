import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Landing } from "../pages/Landing";

describe("Landing page smoke test", () => {
  it("renders hero heading and navigates via primary CTA", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<div data-testid="signup-destination">Signup Destination</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /build the impossible/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /start building/i }));

    expect(await screen.findByTestId("signup-destination")).toBeInTheDocument();
  });
});

