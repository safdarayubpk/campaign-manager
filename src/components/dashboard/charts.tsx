"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContactsByStageProps {
  data: { stage: string; count: number }[];
}

export function ContactsByStageChart({ data }: ContactsByStageProps) {
  const formatted = data.map((d) => ({
    ...d,
    stage: d.stage.charAt(0).toUpperCase() + d.stage.slice(1),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Contacts by Lifecycle Stage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="stage" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface CampaignPerformanceProps {
  data: { name: string; sent: number; opens: number; clicks: number }[];
}

export function CampaignPerformanceChart({ data }: CampaignPerformanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Campaign Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 11 }} />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="sent" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="opens" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="clicks" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
