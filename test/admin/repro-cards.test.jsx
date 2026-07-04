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
  it("resolves descriptor from sectionKey and renders without crashing", async () => {
    render(<SectionEditor sectionKey="projects" />);
    await waitFor(() => expect(screen.getByText("Project Cards")).toBeInTheDocument());
    expect(screen.getByDisplayValue("RedWing")).toBeInTheDocument();
  });
});
