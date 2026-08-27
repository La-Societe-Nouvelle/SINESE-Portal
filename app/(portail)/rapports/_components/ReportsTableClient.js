"use client";

import { useState } from "react";
import ReportsTable from "./ReportsTable";
import ExportBar from "./ExportBar";

export default function ReportsTableClient({ reports, sort, dir }) {
  // Selection is local to the current page/filter view — resets on navigation by design.
  const [selectedIds, setSelectedIds] = useState(new Set());

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = (checked) => {
    setSelectedIds(checked ? new Set(reports.filter((r) => r.storageType === "ovh").map((r) => r.id)) : new Set());
  };

  return (
    <>
      <ReportsTable
        reports={reports}
        sort={sort}
        dir={dir}
        selectedIds={selectedIds}
        onToggle={toggle}
        onToggleAll={toggleAll}
      />
      <ExportBar selectedIds={selectedIds} onClear={() => setSelectedIds(new Set())} />
    </>
  );
}
