"use client";

import { useCallback, useEffect, useState } from "react";
import { SegmentBuilder, SegmentList } from "@/components/segments/segment-builder";
import type { Segment } from "@/lib/types";

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);

  const fetchSegments = useCallback(async () => {
    const res = await fetch("/api/segments");
    const data = await res.json();
    setSegments(data);
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
