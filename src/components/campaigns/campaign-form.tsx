"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, Send, Users } from "lucide-react";
import { toast } from "sonner";
import type { Segment } from "@/lib/types";

const steps = [
  { id: 1, name: "Select Audience" },
  { id: 2, name: "Compose" },
  { id: 3, name: "Review" },
];

export function CampaignForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "email" as "email" | "sms",
    segmentId: "",
    subject: "",
    body: "",
  });

  useEffect(() => {
    fetch("/api/segments")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then(setSegments)
      .catch(() => toast.error("Failed to load segments"));
  }, []);

  const selectedSegment = segments.find((s) => s.id === form.segmentId);

  function canProceed() {
    if (currentStep === 1) return form.name && form.segmentId;
    if (currentStep === 2) return form.subject && form.body;
    return true;
  }

  async function handleSend() {
    setSending(true);
    try {
      // Create campaign
      const createRes = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!createRes.ok) throw new Error();
      const campaign = await createRes.json();

      // Send it
      const sendRes = await fetch(`/api/campaigns/${campaign.id}/send`, {
        method: "POST",
      });
      if (!sendRes.ok) throw new Error();

      toast.success("Campaign sent successfully!");
      router.push("/campaigns");
    } catch {
      toast.error("Failed to send campaign");
    } finally {
      setSending(false);
    }
  }

  async function handleSaveDraft() {
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: "draft" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Campaign saved as draft");
      router.push("/campaigns");
    } catch {
      toast.error("Failed to save draft");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                currentStep > step.id
                  ? "bg-primary text-primary-foreground"
                  : currentStep === step.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
            </div>
            <span
              className={`text-sm ${
                currentStep >= step.id ? "font-medium" : "text-muted-foreground"
              }`}
            >
              {step.name}
            </span>
            {i < steps.length - 1 && (
              <div className="mx-2 h-px w-8 bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Audience */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Audience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name *</Label>
              <Input
                id="campaign-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Q2 Product Launch"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v as "email" | "sms" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Segment *</Label>
              <Select
                value={form.segmentId}
                onValueChange={(v) => setForm({ ...form, segmentId: v ?? "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a segment..." />
                </SelectTrigger>
                <SelectContent>
                  {segments.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.contactCount} contacts)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedSegment && (
              <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  This campaign will target{" "}
                  <strong>{selectedSegment.contactCount}</strong> contacts
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Compose */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line *</Label>
              <Input
                id="subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Exciting updates for you!"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Message Body *</Label>
              <Textarea
                id="body"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Write your message here..."
                rows={8}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Campaign Name</span>
                <span className="font-medium">{form.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="outline">{form.type.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Segment</span>
                <span className="font-medium">
                  {selectedSegment?.name} ({selectedSegment?.contactCount} contacts)
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Subject</span>
                <span className="font-medium">{form.subject}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Message</span>
                <p className="mt-1 rounded-md bg-muted p-3 text-sm">{form.body}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {currentStep < 3 && (
            <Button onClick={handleSaveDraft} variant="outline">
              Save Draft
            </Button>
          )}
          {currentStep < 3 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceed()}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSend} disabled={sending}>
              <Send className="mr-2 h-4 w-4" />
              {sending ? "Sending..." : "Send Campaign"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
