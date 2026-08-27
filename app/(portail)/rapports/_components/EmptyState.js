"use client";

import { FileX } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="text-center py-5">
      <div className="mb-4">
        <FileX className="text-muted" size={48} />
      </div>
      <h4>Aucun rapport trouvé</h4>
      <p className="text-muted">
        Essayez de modifier vos filtres pour voir plus de résultats.
      </p>
    </div>
  );
}
