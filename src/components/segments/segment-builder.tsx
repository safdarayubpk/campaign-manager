"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Users, Save } from "lucide-react";
import { toast } from "sonner";
import type { Segment, SegmentFilter, FilterField, FilterOperator } from "@/lib/types";

const fieldOptions: { value: FilterField; label: string }[] = [
  { value: "lifecycleStage", label: "Lifecycle Stage" },
  { value: "tags", label: "Tags" },
  { value: "company", label: "Company" },
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
];

const operatorsByField: Record<FilterField, { value: FilterOperator; label: string }[]> = {
  lifecycleStage: [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Not Equals" },
  ],
  tags: [{ value: "contains", label: "Contains" }],
  company: [
    { value: "equals", label: "Equals" },
    { value: "contains", label: "Contains" },
  ],
  name: [{ value: "contains", label: "Contains" }],
  email: [{ value: "contains", label: "Contains" }],
};

const stageValues = ["lead", "prospect", "customer", "churned"];

type FilterWithId = SegmentFilter & { _id: string };

function createFilter(overrides?: Partial<SegmentFilter>): FilterWithId {
  return {
    _id: crypto.randomUUID(),
    field: "lifecycleStage",
    operator: "equals",
    value: "lead",
    ...overrides,
  };
}

interface SegmentBuilderProps {
  onSaved: () => void;
}

export function SegmentBuilder({ onSaved }: SegmentBuilderProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [filters, setFilters] = useState<FilterWithId[]>([createFilter()]);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchPreview = useCallback(async () => {
    const validFilters = filters.filter((f) => f.field && f.operator && f.value);
    if (validFilters.length === 0) {
      setPreviewCount(null);
      return;
    }
    try {
      const res = await fetch("/api/segments/count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filters: validFilters.map(({ field, operator, value }) => ({ field, operator, value })),
        }),
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPreviewCount(data.count);
    } catch {
      setPreviewCount(null);
    }
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(fetchPreview, 300);
    return () => clearTimeout(timeout);
  }, [fetchPreview]);

  function addRule() {
    setFilters([...filters, createFilter({ value: "" })]);
  }

  function removeRule(id: string) {
    if (filters.length <= 1) return;
    setFilters(filters.filter((f) => f._id !== id));
  }

  function updateRule(id: string, updates: Partial<SegmentFilter>) {
    setFilters(
      filters.map((f) => {
        if (f._id !== id) return f;
        const updated = { ...f, ...updates };
        if (updates.field && updates.field !== f.field) {
          const ops = operatorsByField[updates.field];
          updated.operator = ops?.[0]?.value ?? "equals";
          updated.value = "";
        }
        return updated;
      })
    );
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Segment name is required");
      return;
    }
    const validFilters = filters.filter((f) => f.field && f.operator && f.value);
    if (validFilters.length === 0) {
      toast.error("At least one complete filter rule is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          filters: validFilters.map(({ field, operator, value }) => ({ field, operator, value })),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Segment created");
      setName("");
      setDescription("");
      setFilters([createFilter()]);
      onSaved();
    } catch {
      toast.error("Failed to create segment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Create Segment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="seg-name">Segment Name *</Label>
            <Input
              id="seg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Active Customers"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seg-desc">Description</Label>
            <Input
              id="seg-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Filter Rules (AND logic)</Label>
          {filters.map((filter, index) => (
            <div key={filter._id} className="flex items-center gap-2">
              {index > 0 && (
                <Badge variant="secondary" className="shrink-0">AND</Badge>
              )}
              <Select
                value={filter.field}
                onValueChange={(v) => updateRule(filter._id, { field: v as FilterField })}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldOptions.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filter.operator}
                onValueChange={(v) => updateRule(filter._id, { operator: v as FilterOperator })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(operatorsByField[filter.field] || []).map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {filter.field === "lifecycleStage" ? (
                <Select
                  value={filter.value || undefined}
                  onValueChange={(v) => updateRule(filter._id, { value: v ?? "" })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {stageValues.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  className="flex-1"
                  value={filter.value}
                  onChange={(e) => updateRule(filter._id, { value: e.target.value })}
                  placeholder="Value..."
                />
              )}

              <Button
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={() => removeRule(filter._id)}
                disabled={filters.length <= 1}
                aria-label="Remove filter rule"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={addRule}>
            <Plus className="mr-1 h-4 w-4" />
            Add Rule
          </Button>
        </div>

        {previewCount !== null && (
          <div className="flex items-center gap-2 rounded-md bg-muted p-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>{previewCount}</strong> contacts match these rules
            </span>
          </div>
        )}

        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Segment"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function SegmentList({ segments }: { segments: Segment[] }) {
  if (segments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No segments created yet. Build your first segment above.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {segments.map((segment) => (
        <Card key={segment.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{segment.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {segment.description && (
              <p className="text-sm text-muted-foreground">{segment.description}</p>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{segment.contactCount} contacts</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {segment.filters.map((f) => (
                <Badge key={`${f.field}-${f.operator}-${f.value}`} variant="outline" className="text-xs">
                  {f.field} {f.operator} &quot;{f.value}&quot;
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
