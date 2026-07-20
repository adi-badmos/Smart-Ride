const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Every admin list service builds its own Mongo filter object (for
// search/status/etc.), then calls this just for the page/limit/skip math
// — kept deliberately simple so it works the same regardless of what
// populate() chains or sort order a given list needs.
export const getPagination = (reqQuery) => {
  const page = Math.max(1, parseInt(reqQuery.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(reqQuery.limit, 10) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildPaginationMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});