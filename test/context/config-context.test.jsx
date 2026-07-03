// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConfigProvider, useConfig } from "@/context/config-context.jsx";

function Show() {
  return <p>{useConfig().siteMetadata.title}</p>;
}
describe("config context", () => {
  it("provides config to consumers", () => {
    render(
      <ConfigProvider value={{ siteMetadata: { title: "Hi" } }}>
        <Show />
      </ConfigProvider>,
    );
    expect(screen.getByText("Hi")).toBeInTheDocument();
  });
});
