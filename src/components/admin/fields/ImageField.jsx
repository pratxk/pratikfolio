/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
"use client";
import { useState } from "react";
import { toast } from "react-toastify";

export default function ImageField({ label, value, onChange, folder = "portfolio" }) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const signRes = await fetch("/api/admin/upload/sign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ folder }),
      });
      const { data, success, error } = await signRes.json();
      if (!success) throw new Error(error || "Could not sign upload");

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", data.apiKey);
      form.append("timestamp", String(data.timestamp));
      form.append("signature", data.signature);
      form.append("folder", folder);

      const upRes = await fetch(
        `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`,
        { method: "POST", body: form },
      );
      const up = await upRes.json();
      if (!up.secure_url) throw new Error(up.error?.message || "Upload failed");
      onChange(up.secure_url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-white/80">{label}</label>
      <div className="flex items-center gap-3">
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-14 w-14 rounded object-cover border border-white/15"
          />
        )}
        <label className="cursor-pointer rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10">
          {uploading ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
        </label>
      </div>
      <input
        className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/70 outline-none"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="or paste an image URL / path"
      />
    </div>
  );
}
