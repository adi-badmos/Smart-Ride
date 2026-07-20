import { Pagination } from 'react-bootstrap';

export default function PaginationControls({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages } = pagination;

  const items = [];
  for (let p = 1; p <= totalPages; p += 1) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
      items.push(
        <Pagination.Item key={p} active={p === page} onClick={() => onPageChange(p)}>
          {p}
        </Pagination.Item>
      );
    } else if (items[items.length - 1]?.key !== `ellipsis-${p}` && !String(items[items.length - 1]?.key).startsWith('ellipsis')) {
      items.push(<Pagination.Ellipsis key={`ellipsis-${p}`} disabled />);
    }
  }

  return (
    <Pagination className="justify-content-center mt-3">
      <Pagination.Prev disabled={page === 1} onClick={() => onPageChange(page - 1)} />
      {items}
      <Pagination.Next disabled={page === totalPages} onClick={() => onPageChange(page + 1)} />
    </Pagination>
  );
}