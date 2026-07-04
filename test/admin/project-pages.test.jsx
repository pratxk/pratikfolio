// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
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
  it("shows a card per page and opens a form modal to edit (no JSON)", async () => {
    render(<SectionEditor sectionKey="project-pages" />);
    await waitFor(() => expect(screen.getAllByText("HologramLib").length).toBeGreaterThanOrEqual(1));
    expect(screen.getByRole("button", { name: /add project page/i })).toBeInTheDocument();
    // open the edit modal -> real form fields appear
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    await waitFor(() => expect(screen.getByDisplayValue("/projects/hologramlib")).toBeInTheDocument());
    // nested content block text is an editable field inside the modal
    expect(screen.getByDisplayValue("hi")).toBeInTheDocument();
    expect(screen.getByDisplayValue("4k")).toBeInTheDocument();
  });
});
