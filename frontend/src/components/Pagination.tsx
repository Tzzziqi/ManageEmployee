interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg border bg-white px-4 py-2 disabled:opacity-50"
      >
        Prev
      </button>

      <span className="px-4 py-2">
        Page {page} / {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border bg-white px-4 py-2 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;