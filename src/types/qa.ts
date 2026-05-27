export const testCaseStatuses = ["DRAFT", "READY", "DEPRECATED"] as const;
export type TestCaseStatus = (typeof testCaseStatuses)[number];

export const testRunStatuses = [
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELED",
] as const;
export type TestRunStatus = (typeof testRunStatuses)[number];

export const executionStatuses = [
  "NOT_RUN",
  "PASSED",
  "FAILED",
  "BLOCKED",
  "SKIPPED",
] as const;
export type ExecutionStatus = (typeof executionStatuses)[number];
