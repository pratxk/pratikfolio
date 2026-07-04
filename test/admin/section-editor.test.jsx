// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SectionEditor from "@/components/admin/SectionEditor.jsx";

beforeEach(() => {
  global.fetch = vi
    .fn()
    .mockResolvedValueOnce({
      json: async () => ({ success: true, data: { siteMetadata: { title: "Hi" } } }),
    }) // GET
    .mockResolvedValueOnce({ json: async () => ({ success: true, data: {} }) }); // PUT
});

describe("SectionEditor", () => {
  it("loads config and saves an edited value", async () => {
    const descriptor = {
      key: "meta",
      label: "Metadata",
      fields: [{ path: ["siteMetadata", "title"], type: "text", label: "Title" }],
    };
    render(<SectionEditor descriptor={descriptor} />);
    const input = await screen.findByLabelText("Title");
    expect(input.value).toBe("Hi");
    fireEvent.change(input, { target: { value: "Yo" } });
    fireEvent.click(screen.getByText("Save changes"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/config",
        expect.objectContaining({ method: "PUT" }),
      ),
    );
  });
});
