import "server-only";

export function parseSearchParams(url: string) {
    const { searchParams } = new URL(url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const search = searchParams.get("search")?.trim() || undefined;
    const sortBy = searchParams.get("sortBy") || undefined;
    const sortOrder = searchParams.get("sortOrder") === "desc" ? "desc" : "asc";

    return { page, limit, search, sortBy, sortOrder, skip: (page - 1) * limit };
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export function paginate<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
): PaginatedResult<T> {
    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}
