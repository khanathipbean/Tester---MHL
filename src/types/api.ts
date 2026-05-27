export type ApiResponse<TData> =
  | {
      ok: true;
      data: TData;
      message?: string;
    }
  | {
      ok: false;
      error: string;
      issues?: Record<string, string[]>;
    };
