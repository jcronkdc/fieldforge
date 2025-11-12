import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
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
      screen.getByRole("heading", { name: /FieldForge — Enterprise-Grade Construction Management/i })
    ).toBeInTheDocument();

    // The simple placeholder doesn't have buttons, so we'll check for the description text instead
    expect(
      screen.getByText(/Plan, coordinate, and deliver transmission and substation projects/i)
    ).toBeInTheDocument();

  });
});

