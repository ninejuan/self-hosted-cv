import { cn } from "@/lib/utils";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { SortableList } from "./sortable-list";
import { ConfirmDialog } from "./confirm-dialog";
import { adminFetch } from "@/lib/admin-api";
import { toast } from "sonner";

interface SectionEditorProps<T extends { id: string }> {
    title: string;
    apiPath: string;
    items: T[];
    onItemsChange: (items: T[]) => void;
    renderListItem: (item: T) => React.ReactNode;
    renderForm: (
        item: T | null,
        onSave: (data: Omit<T, "id"> | T) => void,
        onCancel: () => void,
    ) => React.ReactNode;
    createEmpty: () => Omit<T, "id">;
}

export function SectionEditor<T extends { id: string }>({
    title,
    apiPath,
    items,
    onItemsChange,
    renderListItem,
    renderForm,
    createEmpty,
}: SectionEditorProps<T>) {
    const [editing, setEditing] = useState<T | null>(null);
    const [creating, setCreating] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
    const [saving, setSaving] = useState(false);

    const showForm = editing !== null || creating;

    async function handleSave(data: Omit<T, "id"> | T) {
        setSaving(true);
        try {
            if (editing) {
                const updated = await adminFetch<T>(`${apiPath}/${editing.id}`, {
                    method: "PUT",
                    body: data,
                });
                onItemsChange(items.map((i) => (i.id === editing.id ? updated : i)));
                toast.success("Updated successfully");
            } else {
                const created = await adminFetch<T>(apiPath, {
                    method: "POST",
                    body: data,
                });
                onItemsChange([...items, created]);
                toast.success("Created successfully");
            }
            setEditing(null);
            setCreating(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Save failed");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        try {
            await adminFetch(`${apiPath}/${deleteTarget.id}`, { method: "DELETE" });
            onItemsChange(items.filter((i) => i.id !== deleteTarget.id));
            toast.success("Deleted successfully");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Delete failed");
        } finally {
            setDeleteTarget(null);
        }
    }

    async function handleReorder(reordered: T[]) {
        onItemsChange(reordered);
        try {
            await adminFetch(`${apiPath}/reorder`, {
                method: "PUT",
                body: { ids: reordered.map((i) => i.id) },
            });
        } catch (err) {
            toast.error("Failed to save order");
        }
    }

    function handleCancel() {
        setEditing(null);
        setCreating(false);
    }

    if (showForm) {
        return (
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-[16px] font-semibold text-[var(--color-text-primary)]">
                        {editing ? `Edit ${title}` : `New ${title}`}
                    </h2>
                </div>
                {renderForm(editing, handleSave, handleCancel)}
            </div>
        );
    }

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[16px] font-semibold text-[var(--color-text-primary)]">
                    {title}
                </h2>
                <button
                    type="button"
                    onClick={() => setCreating(true)}
                    className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-opacity",
                        "bg-[var(--color-accent)] text-[#111] hover:opacity-80",
                    )}
                >
                    <Plus className="size-3.5" />
                    Add
                </button>
            </div>

            {items.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[var(--color-border)] px-6 py-10 text-center">
                    <p className="text-[13px] text-[var(--color-text-muted)]">
                        No items yet. Click "Add" to create one.
                    </p>
                </div>
            ) : (
                <SortableList
                    items={items}
                    onReorder={handleReorder}
                    renderItem={(item) => (
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                {renderListItem(item)}
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setEditing(item)}
                                    className="rounded-md p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-tag-bg)] hover:text-[var(--color-text-primary)]"
                                    aria-label="Edit"
                                >
                                    <Pencil className="size-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeleteTarget(item)}
                                    className="rounded-md p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-500"
                                    aria-label="Delete"
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                />
            )}

            <ConfirmDialog
                open={deleteTarget !== null}
                title={`Delete ${title}`}
                description="This action cannot be undone. Are you sure?"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
