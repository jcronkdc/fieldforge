import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DashboardPage } from "../pages/Dashboard";

describe("Dashboard page smoke test", () => {
  it("renders dashboard heading and key quick actions", async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /construction dashboard/i })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("link", { name: /start daily report/i })
    ).toBeInTheDocument();
  });
});

