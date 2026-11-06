// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

afterEach(cleanup);

describe("Button", () => {
  it("renders its label as a button", () => {
    render(<Button>Take over</Button>);
    expect(screen.getByRole("button", { name: "Take over" })).toBeDefined();
  });
});
