"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Send } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Campaign } from "@/lib/types";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  active: "default",
  completed: "outline",
};

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCampaigns() {
    const res = await fetch("/api/campaigns");
    const data = await res.json();
    setCampaigns(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function handleSend(id: string) {
    const res = await fetch(`/api/campaigns/${id}/send`, { method: "POST" });
    if (res.ok) {
      toast.success("Campaign sent!");
      fetchCampaigns();
    } else {
      toast.error("Failed to send");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => router.push("/campaigns/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead className="text-right">Sent</TableHead>
                <TableHead className="text-right">Opens</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    No campaigns yet. Create your first campaign to get started.
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{campaign.type.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[campaign.status] || "secondary"}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {campaign.segment?.name || "—"}
                    </TableCell>
                    <TableCell className="text-right">{campaign.sent || "—"}</TableCell>
                    <TableCell className="text-right">{campaign.opens || "—"}</TableCell>
                    <TableCell className="text-right">{campaign.clicks || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {campaign.sentAt
                        ? format(new Date(campaign.sentAt), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {campaign.status === "draft" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSend(campaign.id)}
                        >
                          <Send className="mr-1 h-3 w-3" />
                          Send
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
