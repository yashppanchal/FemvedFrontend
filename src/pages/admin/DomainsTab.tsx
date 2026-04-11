import { type FormEvent, useEffect, useState } from "react";
import type { DomainForm, DomainRow } from "./types";

import { LoadingScreen } from "../../components/LoadingScreen";
import { PAGE_SIZE } from "../../constants";

type DomainsTabProps = {
  isDomainsLoading: boolean;
  domainLoadError: string | null;
  domainCreateSuccess: string | null;
  domainCreateError: string | null;
  domainForm: DomainForm;
  onDomainFormChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isCreatingDomain: boolean;
  editingDomainId: string | null;
  onCancelEdit: () => void;
  domains: DomainRow[];
  deletingDomainId: string | null;
  onStartEdit: (domain: DomainRow) => void;
  onDelete: (domainId: string) => void;
};

export function DomainsTab({
  isDomainsLoading,
  domainLoadError,
  domainCreateSuccess,
  domainCreateError,
  domainForm,
  onDomainFormChange,
  onSubmit,
  isCreatingDomain,
  editingDomainId,
  onCancelEdit,
  domains,
  deletingDomainId,
  onStartEdit,
  onDelete,
}: DomainsTabProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => { setPage(1); }, [search]);

  const filtered = domains.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="adminPanel" role="tabpanel" aria-label="Domains">
      <div className="adminPanel__header">
        <h2 className="adminPanel__title">Domains</h2>
        <p className="adminPanel__hint">Create top-level program domains.</p>
      </div>

      {isDomainsLoading && <LoadingScreen compact message="Loading domains…" />}
      {domainLoadError && <p className="adminPanel__error">{domainLoadError}</p>}
      {domainCreateSuccess && (
        <p className="adminPanel__success">{domainCreateSuccess}</p>
      )}
      {domainCreateError && <p className="adminPanel__error">{domainCreateError}</p>}

      <form className="form adminForm" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span className="field__label">Domain name</span>
          <input
            className="field__input"
            type="text"
            value={domainForm.name}
            onChange={(e) => onDomainFormChange(e.target.value)}
            placeholder="Enter domain name"
            required
          />
        </label>

        <div className="adminForm__actions">
          <button type="submit" className="button" disabled={isCreatingDomain}>
            {editingDomainId
              ? isCreatingDomain
                ? "Saving…"
                : "Save Changes"
              : isCreatingDomain
                ? "Creating…"
                : "Create Domain"}
          </button>
          {editingDomainId && (
            <button
              type="button"
              className="adminActionButton"
              onClick={onCancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="adminPanel__toolbar">
        <input className="field__input adminPanel__search" type="search" placeholder="Search domains…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <span className="adminPanel__count">{filtered.length} domains</span>
      </div>

      {Math.ceil(filtered.length / PAGE_SIZE) > 1 && (
        <div className="adminPanel__pagination">
          <button type="button" className="adminActionButton" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          <button type="button" className="adminActionButton" disabled={page >= Math.ceil(filtered.length / PAGE_SIZE)} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th scope="col">Domain</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((domain) => (
                <tr key={domain.id}>
                  <td>{domain.name}</td>
                  <td>
                    <div className="adminActionGroup">
                      <button
                        type="button"
                        className="adminActionButton"
                        onClick={() => onStartEdit(domain)}
                        aria-label={`Edit domain ${domain.name}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="adminActionButton adminActionButton--danger"
                        disabled={deletingDomainId === domain.id}
                        onClick={() => onDelete(domain.id)}
                        aria-label={`Archive domain ${domain.name}`}
                      >
                        {deletingDomainId === domain.id ? "Archiving..." : "Archive"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="adminTable__empty">
                  No domains yet. Add one to begin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
