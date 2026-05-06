interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

const PaginationControls = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  itemLabel,
  onPageChange,
}: PaginationControlsProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="mt-8 flex flex-col gap-4 rounded-[1.5rem] border border-border/60 bg-card/80 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <p className="font-body text-sm text-muted-foreground">
        Showing {startItem}-{endItem} of {totalItems} {itemLabel}
        {totalItems === 1 ? "" : "s"}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-full border border-border bg-background px-4 py-2 font-body text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`h-10 min-w-10 rounded-full px-3 font-body text-xs uppercase tracking-[0.18em] transition-colors ${
              currentPage === page
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-foreground hover:bg-card"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-full border border-border bg-background px-4 py-2 font-body text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
