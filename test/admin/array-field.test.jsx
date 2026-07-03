// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ArrayField from "@/components/admin/fields/ArrayField.jsx";

describe("ArrayField", () => {
  it("adds items", () => {
    const onChange = vi.fn();
    render(
      <ArrayField
        label="Cards"
        items={[{ title: "A" }]}
        newItem={() => ({ title: "" })}
        onChange={onChange}
        onReorder={() => {}}
        render={(it) => <span>{it.title}</span>}
      />,
    );
    fireEvent.click(screen.getByText("Add"));
    expect(onChange).toHaveBeenCalledWith([{ title: "A" }, { title: "" }]);
  });

  it("deletes items", () => {
    const onChange = vi.fn();
    render(
      <ArrayField
        label="Cards"
        items={[{ title: "A" }, { title: "B" }]}
        newItem={() => ({ title: "" })}
        onChange={onChange}
        render={(it) => <span>{it.title}</span>}
      />,
    );
    fireEvent.click(screen.getAllByText("Delete")[0]);
    expect(onChange).toHaveBeenCalledWith([{ title: "B" }]);
  });
});
