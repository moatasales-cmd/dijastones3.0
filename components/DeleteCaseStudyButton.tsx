"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Admin: delete a case study (with confirmation). Used on the list and editor. */
export default function DeleteCaseStudyButton({
  caseStudyId,
  title,
  redirectTo,
}: {
  caseStudyId: string;
  title: string;
  /** where to go after deletion (editor page); omit to just refresh (list) */
  redirectTo?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!window.confirm(`Delete "${title}" permanently?\n\nThis also removes its linked Journal article.`)) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/case-studies/${encodeURIComponent(caseStudyId)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.ok) {
        if (redirectTo) window.location.href = redirectTo;
        else router.refresh();
      } else {
        alert(json.error || "Delete failed");
        setBusy(false);
      }
    } catch {
      alert("Delete failed");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      className="text-red-600 hover:text-red-800 hover:underline disabled:opacity-50"
      title={`Delete ${title}`}
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
