import "server-only";

export type Role = "ADMIN" | "QA" | "VIEWER";

export function canCreate(role: Role): boolean {
    return role === "ADMIN" || role === "QA";
}

export function canEdit(role: Role): boolean {
    return role === "ADMIN" || role === "QA";
}

export function canDelete(role: Role): boolean {
    return role === "ADMIN";
}

export function canManageUsers(role: Role): boolean {
    return role === "ADMIN";
}

export function canView(role: Role): boolean {
    return true;
}
