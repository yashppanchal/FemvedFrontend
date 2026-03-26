import { useState, type KeyboardEvent } from "react";

type PaginationProps = {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
};

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

export default function Pagination({
  page,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: PaginationProps) {
  const [jumpValue, setJumpValue] = useState("");

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = Math.min((page - 1) * pageSize + 1, totalItems);
  const end = Math.min(page * pageSize, totalItems);

  const handleJump = () => {
    const target = parseInt(jumpValue, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      onPageChange(target);
    }
    setJumpValue("");
  };

  const handleJumpKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleJump();
    }
  };

  if (totalItems <= 0) return null;

  return (
    <div className="adminPanel__pagination">
      <button
        type="button"
        className="adminActionButton"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        &larr; Prev
      </button>

      <span className="pagination__info">
        Showing {start}&ndash;{end} of {totalItems}
      </span>

      <span className="pagination__info">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        className="adminActionButton"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next &rarr;
      </button>

      {onPageSizeChange && (
        <select
          className="field__input pagination__sizeSelect"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          aria-label="Items per page"
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt} / page
            </option>
          ))}
        </select>
      )}

      <input
        className="field__input pagination__jumpInput"
        type="number"
        min={1}
        max={totalPages}
        placeholder="Go to"
        value={jumpValue}
        onChange={(e) => setJumpValue(e.target.value)}
        onKeyDown={handleJumpKeyDown}
        onBlur={handleJump}
        aria-label="Jump to page"
      />
    </div>
  );
}
