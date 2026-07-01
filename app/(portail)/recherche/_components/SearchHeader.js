"use client";

import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function SearchHeader({ initialQuery }) {
  const [query, setQuery] = useState(initialQuery);
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  // Keep input in sync when URL changes externally (e.g. reset from sidebar)
  useEffect(() => {
    setQuery(searchParams.get("s") || "");
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (query.trim()) params.set("s", query.trim());
    else params.delete("s");
    params.delete("p");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="search-header bg-primary text-white py-4">
      <div className="container-fluid">
        <div className="row justify-content-center text-center">
          <div className="col-lg-8">
            <h2 className="h3 text-white mb-3">Rechercher l'empreinte sociétale des entreprises</h2>

            <Form onSubmit={handleSubmit} className="search-form">
              <div className="position-relative">
                <Form.Control
                  type="text"
                  placeholder="Nom d'entreprise ou N° SIREN"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  className="border-0 shadow-sm py-2 px-3"
                  style={{
                    fontSize: '1rem',
                    borderRadius: '0.5rem',
                    paddingRight: '180px'
                  }}
                />
                <Button
                  variant="secondary"
                  type="submit"
                  className="position-absolute top-50 end-0 translate-middle-y border-0"
                  style={{
                    fontSize: '0.875rem',
                    borderRadius: '0 0.5rem 0.5rem 0',
                    right: '0px'
                  }}
                >
                  <Search size={16} className="me-1" />
                  Rechercher une entreprise
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
