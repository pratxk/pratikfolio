// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import SectionEditor from "@/components/admin/SectionEditor.jsx";

beforeEach(() => {
  const config = {
    siteMetadata: {}, global: {}, resume_button: {}, footer: {}, card: {}, cards: [],
    pages: {
      custom: {
        HologramLib: {
          enabled: true, navbar: false, title: "HologramLib", route: "/projects/hologramlib",
          description: "desc", images: ["/a.png"], tags: ["Library"],
          content: [{ type: "text", content: "hi" }],
          statistics: { downloads: { title: "Downloads", description: "d", value: "4k", color: "blue" } },
          buttons: [{ label: "Download", route: "u", style: "primary" }],
        },
      },
    },
  };
  global.fetch = vi.fn().mockResolvedValue({ json: async () => ({ success: true, data: config }) });
});

describe("Project Detail Pages editor", () => {
  it("renders nested forms (not JSON) for each page", async () => {
    render(<SectionEditor sectionKey="project-pages" />);
    await waitFor(() => expect(screen.getByText("Project Detail Pages")).toBeInTheDocument());
    // page key + title both rendered as form inputs, not raw JSON
    expect(screen.getAllByDisplayValue("HologramLib").length).toBeGreaterThanOrEqual(2);
    // nested content block text present
    expect(screen.getByDisplayValue("hi")).toBeInTheDocument();
    // nested statistic value present
    expect(screen.getByDisplayValue("4k")).toBeInTheDocument();
    // "Add project page" and "Add block" buttons exist (proper add/delete UI)
    expect(screen.getByText("Add project page")).toBeInTheDocument();
    expect(screen.getByText("Add block")).toBeInTheDocument();
  });
});
