"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
    User,
    Lock,
    Palette,
    Bell,
    FolderCog,
    FileSpreadsheet,
    Shield,
    Sun,
    Moon,
    Sparkles,
    Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useMounted } from "@/hooks/use-mounted";

interface SettingsClientProps {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    isAdmin: boolean;
}

export function SettingsClient({ user, isAdmin }: SettingsClientProps) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground">
                    Manage your account and application preferences
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
                    <TabsTrigger value="profile" className="gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger value="password" className="gap-1.5">
                        <Lock className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Password</span>
                    </TabsTrigger>
                    <TabsTrigger value="theme" className="gap-1.5">
                        <Palette className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Theme</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-1.5">
                        <Bell className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Notifications</span>
                    </TabsTrigger>
                    <TabsTrigger value="defaults" className="gap-1.5">
                        <FolderCog className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Defaults</span>
                    </TabsTrigger>
                    <TabsTrigger value="import" className="gap-1.5">
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Import</span>
                    </TabsTrigger>
                    {isAdmin && (
                        <TabsTrigger value="system" className="gap-1.5">
                            <Shield className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">System</span>
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="profile">
                    <ProfileSection user={user} />
                </TabsContent>

                <TabsContent value="password">
                    <PasswordSection />
                </TabsContent>

                <TabsContent value="theme">
                    <ThemeSection />
                </TabsContent>

                <TabsContent value="notifications">
                    <NotificationsSection />
                </TabsContent>

                <TabsContent value="defaults">
                    <ProjectDefaultsSection />
                </TabsContent>

                <TabsContent value="import">
                    <ImportExportSection />
                </TabsContent>

                {isAdmin && (
                    <TabsContent value="system">
                        <SystemConfigSection />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

// ─── Profile Section ───────────────────────────────────────────

function ProfileSection({ user }: { user: SettingsClientProps["user"] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);

    const handleSave = async () => {
        if (!name.trim()) { toast.error("Name is required"); return; }
        if (!email.trim()) { toast.error("Email is required"); return; }

        try {
            const res = await fetch("/api/settings/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), email: email.trim() }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to update profile");
            }
            toast.success("Profile updated successfully");
            startTransition(() => router.refresh());
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to update profile");
        }
    };

    const initials = name
        ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-lg bg-primary/10 text-primary">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.role}</p>
                    </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isPending}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Password Section ──────────────────────────────────────────

function PasswordSection() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleChange = async () => {
        if (!currentPassword) { toast.error("Current password is required"); return; }
        if (!newPassword || newPassword.length < 6) { toast.error("New password must be at least 6 characters"); return; }
        if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }

        try {
            const res = await fetch("/api/settings/password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to change password");
            }
            toast.success("Password changed successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to change password");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="max-w-md space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password <span className="text-destructive">*</span></Label>
                        <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password <span className="text-destructive">*</span></Label>
                        <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 6 characters"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password <span className="text-destructive">*</span></Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleChange} disabled={isPending}>
                        <Lock className="mr-2 h-4 w-4" />
                        Change Password
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Theme Section ─────────────────────────────────────────────

function ThemeSection() {
    const { theme, setTheme } = useTheme();
    const mounted = useMounted();

    const themes = [
        { value: "light", label: "Light", icon: Sun, description: "Clean and bright interface" },
        { value: "dark", label: "Dark", icon: Moon, description: "Easy on the eyes in low light" },
        { value: "gradient", label: "Gradient", icon: Sparkles, description: "Blue aurora with animations" },
    ];

    if (!mounted) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Choose your preferred appearance</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                    {themes.map((t) => {
                        const Icon = t.icon;
                        const isActive = theme === t.value;
                        return (
                            <button
                                key={t.value}
                                onClick={() => setTheme(t.value)}
                                className={`relative flex flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all hover:shadow-md ${isActive
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-border hover:border-primary/50"
                                    }`}
                            >
                                <Icon className={`h-8 w-8 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                                <div className="text-center">
                                    <p className={`font-medium ${isActive ? "text-primary" : ""}`}>{t.label}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                                </div>
                                {isActive && (
                                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Notifications Section ─────────────────────────────────────

function NotificationsSection() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [testRunComplete, setTestRunComplete] = useState(true);
    const [defectAssigned, setDefectAssigned] = useState(true);
    const [statusChange, setStatusChange] = useState(false);
    const [importComplete, setImportComplete] = useState(true);

    useEffect(() => {
        fetch("/api/settings/notifications")
            .then((res) => res.json())
            .then((json) => {
                if (json.ok) {
                    const p = json.data;
                    setEmailEnabled(p.emailEnabled);
                    setTestRunComplete(p.testRunComplete);
                    setDefectAssigned(p.defectAssigned);
                    setStatusChange(p.statusChange);
                    setImportComplete(p.importComplete);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const savePrefs = async (field: string, value: boolean) => {
        setSaving(true);
        try {
            const res = await fetch("/api/settings/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [field]: value }),
            });
            if (res.ok) {
                toast.success("Notification preference saved");
            }
        } catch {
            toast.error("Failed to save preference");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Configure how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-sm">Email Notifications</p>
                            <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                        </div>
                        <Switch
                            checked={emailEnabled}
                            disabled={saving}
                            onCheckedChange={(v) => { setEmailEnabled(v); savePrefs("emailEnabled", v); }}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-sm">Test Run Completed</p>
                            <p className="text-xs text-muted-foreground">Notify when a test run finishes</p>
                        </div>
                        <Switch
                            checked={testRunComplete}
                            disabled={saving}
                            onCheckedChange={(v) => { setTestRunComplete(v); savePrefs("testRunComplete", v); }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-sm">Defect Assigned</p>
                            <p className="text-xs text-muted-foreground">Notify when a defect is assigned to you</p>
                        </div>
                        <Switch
                            checked={defectAssigned}
                            disabled={saving}
                            onCheckedChange={(v) => { setDefectAssigned(v); savePrefs("defectAssigned", v); }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-sm">Test Case Status Change</p>
                            <p className="text-xs text-muted-foreground">Notify on pass/fail status changes</p>
                        </div>
                        <Switch
                            checked={statusChange}
                            disabled={saving}
                            onCheckedChange={(v) => { setStatusChange(v); savePrefs("statusChange", v); }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-sm">Import Complete</p>
                            <p className="text-xs text-muted-foreground">Notify when file import finishes</p>
                        </div>
                        <Switch
                            checked={importComplete}
                            disabled={saving}
                            onCheckedChange={(v) => { setImportComplete(v); savePrefs("importComplete", v); }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Project Defaults Section ──────────────────────────────────

function ProjectDefaultsSection() {
    const [defaultPriority, setDefaultPriority] = useState("MEDIUM");
    const [defaultStatus, setDefaultStatus] = useState("NOT_RUN");
    const [defaultType, setDefaultType] = useState("FUNCTIONAL");

    return (
        <Card>
            <CardHeader>
                <CardTitle>Project Defaults</CardTitle>
                <CardDescription>Set default values when creating new test cases</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3 max-w-2xl">
                    <div className="space-y-2">
                        <Label>Default Priority</Label>
                        <Select value={defaultPriority} onValueChange={setDefaultPriority}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CRITICAL">Critical</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="LOW">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Default Status</Label>
                        <Select value={defaultStatus} onValueChange={setDefaultStatus}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PASS">Pass</SelectItem>
                                <SelectItem value="FAIL">Fail</SelectItem>
                                <SelectItem value="NOT_RUN">Not Run</SelectItem>
                                <SelectItem value="BLOCKED">Blocked</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Default Type</Label>
                        <Select value={defaultType} onValueChange={setDefaultType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FUNCTIONAL">Functional</SelectItem>
                                <SelectItem value="REGRESSION">Regression</SelectItem>
                                <SelectItem value="SMOKE">Smoke</SelectItem>
                                <SelectItem value="INTEGRATION">Integration</SelectItem>
                                <SelectItem value="E2E">E2E</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground italic">
                    Note: These defaults will be applied automatically in a future update.
                </p>
            </CardContent>
        </Card>
    );
}

// ─── Import/Export Config Section ──────────────────────────────

function ImportExportSection() {
    const columns = [
        { key: "A", label: "Key (Test ID)", description: "Unique identifier for each test case" },
        { key: "B", label: "Module", description: "Module/suite name for grouping" },
        { key: "C", label: "Condition (Title)", description: "Test condition or title" },
        { key: "D", label: "Test Steps", description: "Steps to execute" },
        { key: "E", label: "Expected Result", description: "Expected outcome" },
        { key: "F", label: "Priority", description: "CRITICAL, HIGH, MEDIUM, LOW" },
        { key: "G", label: "Status", description: "PASS, FAIL, DRAFT, READY, NOT RUN, BLOCKED" },
        { key: "H", label: "Notes", description: "Additional notes or comments" },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Import / Export Configuration</CardTitle>
                <CardDescription>Column mapping for Excel/CSV import</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-lg border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-2 text-left font-medium">Column</th>
                                <th className="px-4 py-2 text-left font-medium">Field</th>
                                <th className="px-4 py-2 text-left font-medium">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {columns.map((col) => (
                                <tr key={col.key} className="border-b last:border-0">
                                    <td className="px-4 py-2 font-mono font-semibold text-primary">{col.key}</td>
                                    <td className="px-4 py-2 font-medium">{col.label}</td>
                                    <td className="px-4 py-2 text-muted-foreground">{col.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="rounded-lg border border-dashed p-4 space-y-2">
                    <p className="text-sm font-medium">Import Rules:</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li>First row is treated as header and skipped</li>
                        <li>Rows with Key or Module or Title are imported</li>
                        <li>Rows with only Key/Module (no data from Column C onward) are skipped as section headers</li>
                        <li>If Key already exists in project, the row will update the existing test case</li>
                        <li>New modules are created automatically if not found</li>
                        <li>Priority defaults to MEDIUM if not specified</li>
                        <li>Status defaults to DRAFT if not specified</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── System Config Section (Admin Only) ────────────────────────

function SystemConfigSection() {
    const [allowRegistration, setAllowRegistration] = useState(false);
    const [maxFileSize, setMaxFileSize] = useState("10");
    const [sessionTimeout, setSessionTimeout] = useState("24");

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Admin-only settings that affect all users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-sm">Allow User Registration</p>
                            <p className="text-xs text-muted-foreground">Allow new users to self-register</p>
                        </div>
                        <Switch checked={allowRegistration} onCheckedChange={setAllowRegistration} />
                    </div>

                    <Separator />

                    <div className="grid gap-4 sm:grid-cols-2 max-w-md">
                        <div className="space-y-2">
                            <Label>Max Upload Size (MB)</Label>
                            <Input
                                type="number"
                                value={maxFileSize}
                                onChange={(e) => setMaxFileSize(e.target.value)}
                                min="1"
                                max="100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Session Timeout (hours)</Label>
                            <Input
                                type="number"
                                value={sessionTimeout}
                                onChange={(e) => setSessionTimeout(e.target.value)}
                                min="1"
                                max="168"
                            />
                        </div>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground italic">
                    Note: System configuration persistence will be available in a future update.
                </p>
            </CardContent>
        </Card>
    );
}
