export interface Meta {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta: Meta;
}
