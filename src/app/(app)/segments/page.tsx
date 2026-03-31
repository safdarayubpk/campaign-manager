"use client";

import { useCallback, useEffect, useState } from "react";
import { SegmentBuilder, SegmentList } from "@/components/segments/segment-builder";
import { toast } from "sonner";
import type { Segment } from "@/lib/types";

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);

  const fetchSegments = useCallback(async () => {
    try {
      const res = await fetch("/api/segments");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSegments(data);
    } catch {
      toast.error("Failed to load segments");
    }
  }, []);

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  return (
    <div className="space-y-6">
      <SegmentBuilder onSaved={fetchSegments} />
      <div>
        <h2 className="mb-4 text-lg font-semibold">Saved Segments</h2>
        <SegmentList segments={segments} />
      </div>
    </div>
  );
}
