"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface ContactFiltersProps {
  search: string;
  stage: string;
  tag: string;
  onSearchChange: (value: string) => void;
  onStageChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onClear: () => void;
}

const stages = [
  { value: "all", label: "All Stages" },
  { value: "lead", label: "Lead" },
  { value: "prospect", label: "Prospect" },
  { value: "customer", label: "Customer" },
  { value: "churned", label: "Churned" },
];

const tags = [
  { value: "all", label: "All Tags" },
  { value: "newsletter", label: "Newsletter" },
  { value: "vip", label: "VIP" },
  { value: "enterprise", label: "Enterprise" },
  { value: "trial-user", label: "Trial User" },
  { value: "webinar-attendee", label: "Webinar Attendee" },
  { value: "product-demo", label: "Product Demo" },
  { value: "referral", label: "Referral" },
  { value: "high-value", label: "High Value" },
  { value: "churned-risk", label: "Churned Risk" },
  { value: "active-user", label: "Active User" },
];

export function ContactFilters({
  search,
  stage,
  tag,
  onSearchChange,
  onStageChange,
  onTagChange,
  onClear,
}: ContactFiltersProps) {
  const hasFilters = search || stage || tag;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={stage || "all"} onValueChange={(v) => onStageChange(v === "all" ? "" : v ?? "")}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Stage" />
        </SelectTrigger>
        <SelectContent>
          {stages.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={tag || "all"} onValueChange={(v) => onTagChange(v === "all" ? "" : v ?? "")}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Tag" />
        </SelectTrigger>
        <SelectContent>
          {tags.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
