// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import SectionEditor from "@/components/admin/SectionEditor.jsx";

beforeEach(() => {
  const config = {
    siteMetadata: {}, global: {}, resume_button: {}, footer: {}, pages: {}, card: {},
    cards: [
      { title: "RedWing", description: "d", imageSRC: "/x.png", buttonText: "V", buttonURL: "u", badges: [] },
      { title: "ODM", description: "d2", imageSRC: "/y.png", buttonText: "V", buttonURL: "u", badges: ["Next"] },
    ],
  };
  global.fetch = vi.fn().mockResolvedValue({ json: async () => ({ success: true, data: config }) });
});

describe("Project Cards editor", () => {
  it("renders cards (not raw inputs) without crashing", async () => {
    render(<SectionEditor sectionKey="projects" />);
    await waitFor(() => expect(screen.getByText("RedWing")).toBeInTheDocument());
    expect(screen.getByText("ODM")).toBeInTheDocument();
    // add + per-card edit controls exist
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /edit/i }).length).toBe(2);
  });
});
