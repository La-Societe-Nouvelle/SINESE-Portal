import { Container } from "react-bootstrap";
import { FileCheck } from "lucide-react";
import { listPublishedReports, getReportFilterOptions } from "@/actions/reports";
import { parseReportFiltersFromParams, parseReportSort } from "./_utils/reportParams";
import ReportsFilterBar from "./_components/ReportsFilterBar";
import ReportsTableClient from "./_components/ReportsTableClient";
import ReportsPagination from "./_components/ReportsPagination";
import EmptyState from "./_components/EmptyState";

export default async function RapportsPage({ searchParams }) {
  const params = await searchParams;
  const filters = parseReportFiltersFromParams(params);
  const { sort, dir } = parseReportSort(params);
  const parsedPage = parseInt(params.p, 10);
  const page = Number.isInteger(parsedPage) ? Math.max(1, parsedPage) : 1;

  const [{ reports, total, perPage }, { years }] = await Promise.all([
    listPublishedReports(filters, sort, dir, page),
    getReportFilterOptions(),
  ]);

  const rangeStart = total === 0 ? 0 : (page - 1) * perPage + 1;
  const rangeEnd = Math.min(page * perPage, total);

  return (
    <div className="rapports-page">
      <div className="rapports-header bg-primary text-white py-4">
        <Container>
          <div className="d-flex align-items-center">
            <div className="page-icon me-3">
              <FileCheck size={20} aria-hidden="true" />
            </div>
            <div>
              <h1 className="h3 mb-1">Rapports de durabilité</h1>
              <p className="mb-0 opacity-8">
                Recherchez et téléchargez les rapports de durabilité publiés sur SINESE.
              </p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        <div className="main-content">
          <ReportsFilterBar availableYears={years} />

          {reports.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <p className="rapports-results-count">
                {rangeStart}–{rangeEnd} sur {total} rapport{total > 1 ? "s" : ""}
              </p>
              <ReportsTableClient key={`${JSON.stringify(filters)}-${sort}-${dir}-${page}`} reports={reports} sort={sort} dir={dir} />
              <ReportsPagination total={total} currentPage={page} perPage={perPage} />
            </>
          )}
        </div>
      </Container>
    </div>
  );
}
