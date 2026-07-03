// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TextField from "@/components/admin/fields/TextField.jsx";
import ToggleField from "@/components/admin/fields/ToggleField.jsx";

describe("TextField", () => {
  it("renders label and emits changes", () => {
    const onChange = vi.fn();
    render(<TextField label="Title" value="Hi" onChange={onChange} />);
    const input = screen.getByLabelText("Title");
    expect(input.value).toBe("Hi");
    fireEvent.change(input, { target: { value: "Bye" } });
    expect(onChange).toHaveBeenCalledWith("Bye");
  });
});

describe("ToggleField", () => {
  it("emits boolean on toggle", () => {
    const onChange = vi.fn();
    render(<ToggleField label="Enabled" value={false} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Enabled"));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
