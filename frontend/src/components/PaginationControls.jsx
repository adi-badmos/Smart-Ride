export default function PaginationControls({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages } = pagination;

  const items = [];
  for (let p = 1; p <= totalPages; p += 1) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
      items.push({ type: 'page', p });
    } else if (
      items.length === 0 ||
      items[items.length - 1].type !== 'ellipsis'
    ) {
      items.push({ type: 'ellipsis', p });
    }
  }

  return (
    <div className="sr-pagination">
      <button
        className="sr-page-btn"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        ‹
      </button>

      {items.map((item) =>
        item.type === 'ellipsis' ? (
          <span key={`ellipsis-${item.p}`} className="sr-page-btn" style={{ cursor: 'default', opacity: 0.35 }}>
            …
          </span>
        ) : (
          <button
            key={item.p}
            className={'sr-page-btn' + (item.p === page ? ' active' : '')}
            onClick={() => onPageChange(item.p)}
          >
            {item.p}
          </button>
        )
      )}

      <button
        className="sr-page-btn"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        ›
      </button>
    </div>
  );
}