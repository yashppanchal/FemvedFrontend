import { type FormEvent, useState } from "react";
import type { DomainForm, DomainRow } from "./types";

const PAGE_SIZE = 15;

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

  return (
    <section className="adminPanel" role="tabpanel" aria-label="Domains">
      <div className="adminPanel__header">
        <h2 className="adminPanel__title">Domains</h2>
        <p className="adminPanel__hint">Create top-level program domains.</p>
      </div>

      {isDomainsLoading && <p className="adminPanel__hint">Loading domains...</p>}
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
                ? "Updating Domain..."
                : "Update Domain"
              : isCreatingDomain
                ? "Adding Domain..."
                : "Add Domain"}
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

      {Math.ceil(domains.length / PAGE_SIZE) > 1 && (
        <div className="adminPanel__pagination">
          <button type="button" className="adminActionButton" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{Math.min(page * PAGE_SIZE, domains.length)} of {domains.length}</span>
          <button type="button" className="adminActionButton" disabled={page >= Math.ceil(domains.length / PAGE_SIZE)} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Domain</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {domains.length > 0 ? (
              domains.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((domain) => (
                <tr key={domain.id}>
                  <td>{domain.name}</td>
                  <td>
                    <div className="adminActionGroup">
                      <button
                        type="button"
                        className="adminActionButton"
                        onClick={() => onStartEdit(domain)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="adminActionButton adminActionButton--danger"
                        disabled={deletingDomainId === domain.id}
                        onClick={() => onDelete(domain.id)}
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
