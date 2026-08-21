"use client";

import { Pagination } from "react-bootstrap";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function ReportsPagination({ total, currentPage, perPage }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / perPage);

  if (totalPages <= 1) return null;

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    if (newPage > 1) params.set("p", String(newPage));
    else params.delete("p");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setTimeout(() => { document.documentElement.scrollTop = 0; }, 100);
  };

  const items = [];
  for (let n = 1; n <= totalPages; n++) {
    if (n === 1 || n === totalPages || (n >= currentPage - 2 && n <= currentPage + 2)) {
      items.push(
        <Pagination.Item key={n} active={n === currentPage} onClick={() => handlePageChange(n)}>
          {n}
        </Pagination.Item>
      );
    } else if ((n === currentPage - 3 && n > 1) || (n === currentPage + 3 && n < totalPages)) {
      items.push(<Pagination.Ellipsis key={`ellipsis-${n}`} disabled />);
    }
  }

  return (
    <div className="d-flex justify-content-center mt-4">
      <Pagination>
        <Pagination.Prev onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} />
        {items}
        <Pagination.Next onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} />
      </Pagination>
    </div>
  );
}
