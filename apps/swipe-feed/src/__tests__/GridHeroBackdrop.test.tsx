import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { GridHeroBackdrop } from "../components/graphics/GridHeroBackdrop";

describe("GridHeroBackdrop visual regression", () => {
  it("matches snapshot", () => {
    const { container } = render(<GridHeroBackdrop />);
    expect(container.firstChild).toMatchInlineSnapshot(`
      <img
        alt=""
        aria-hidden="true"
        class="absolute inset-0 h-full w-full object-cover"
        decoding="async"
        height="720"
        loading="eager"
        role="presentation"
        src="/hero-backdrop.svg"
        width="1440"
      />
    `);
  });
});

