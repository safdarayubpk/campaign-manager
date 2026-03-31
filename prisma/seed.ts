import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

const companies = [
  "Acme Corp",
  "TechFlow Inc",
  "DataSync Labs",
  "CloudNine Solutions",
  "Vertex AI",
  "Pinnacle Group",
  "NovaStar Tech",
  "BrightEdge Digital",
  "Summit Analytics",
  "Forge Systems",
  "Quantum Leap Co",
  "Ironclad Security",
  "Mosaic Media",
  "Streamline Ops",
  "Catalyst Ventures",
];

const firstNames = [
  "Sarah", "James", "Maria", "David", "Emma", "Michael", "Olivia", "Robert",
  "Sophia", "William", "Isabella", "John", "Mia", "Richard", "Charlotte",
  "Thomas", "Amelia", "Daniel", "Harper", "Matthew", "Evelyn", "Andrew",
  "Abigail", "Christopher", "Emily", "Joseph", "Elizabeth", "Charles",
  "Sofia", "Alexander", "Avery", "Benjamin", "Ella", "Henry", "Scarlett",
  "Samuel", "Grace", "Nathan", "Lily", "Patrick", "Chloe", "Ryan",
  "Victoria", "Kevin", "Riley", "Brandon", "Zoey", "Tyler", "Nora", "Jason",
  "Hannah", "Eric", "Stella", "Jack", "Lucy",
];

const lastNames = [
  "Anderson", "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Lewis",
  "Lee", "Walker", "Hall", "Allen", "Young", "King", "Wright", "Scott",
  "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker",
  "Gonzalez", "Carter", "Mitchell", "Perez", "Roberts", "Turner", "Phillips",
  "Campbell", "Parker", "Evans", "Edwards", "Collins", "Stewart", "Sanchez",
  "Morris", "Rogers", "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey",
  "Rivera", "Cooper", "Richardson", "Cox", "Howard", "Ward", "Brooks",
  "Kelly", "Sanders", "Price",
];

const tagOptions = [
  "newsletter",
  "vip",
  "enterprise",
  "trial-user",
  "webinar-attendee",
  "product-demo",
  "referral",
  "high-value",
  "churned-risk",
  "active-user",
];

const stages: Array<"lead" | "prospect" | "customer" | "churned"> = [
  "lead",
  "prospect",
  "customer",
  "churned",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomTags(): string[] {
  const count = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...tagOptions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomDate(daysBack: number): Date {
  const now = new Date();
  const offset = Math.floor(Math.random() * daysBack);
  return new Date(now.getTime() - offset * 24 * 60 * 60 * 1000);
}

function randomPhone(): string {
  const area = Math.floor(Math.random() * 900) + 100;
  const mid = Math.floor(Math.random() * 900) + 100;
  const end = Math.floor(Math.random() * 9000) + 1000;
  return `(${area}) ${mid}-${end}`;
}

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.campaign.deleteMany();
  await prisma.segment.deleteMany();
  await prisma.contact.deleteMany();

  // Create 55 contacts
  const usedEmails = new Set<string>();
  const contacts = [];

  for (let i = 0; i < 55; i++) {
    const firstName = randomFrom(firstNames);
    const lastName = randomFrom(lastNames);
    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomFrom(companies).toLowerCase().replace(/\s+/g, "")}.com`;

    // Ensure unique emails
    while (usedEmails.has(email)) {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 99)}@${randomFrom(companies).toLowerCase().replace(/\s+/g, "")}.com`;
    }
    usedEmails.add(email);

    contacts.push(
      await prisma.contact.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          phone: Math.random() > 0.3 ? randomPhone() : null,
          company: Math.random() > 0.1 ? randomFrom(companies) : null,
          lifecycleStage: randomFrom(stages),
          tags: JSON.stringify(randomTags()),
          createdAt: randomDate(180),
        },
      })
    );
  }

  console.log(`Created ${contacts.length} contacts`);

  // Create segments
  const segments = await Promise.all([
    prisma.segment.create({
      data: {
        name: "Active Customers",
        description: "All contacts with customer lifecycle stage",
        filters: JSON.stringify([
          { field: "lifecycleStage", operator: "equals", value: "customer" },
        ]),
        contactCount: contacts.filter((c) => c.lifecycleStage === "customer").length,
      },
    }),
    prisma.segment.create({
      data: {
        name: "Enterprise Leads",
        description: "Leads tagged as enterprise",
        filters: JSON.stringify([
          { field: "lifecycleStage", operator: "equals", value: "lead" },
          { field: "tags", operator: "contains", value: "enterprise" },
        ]),
        contactCount: contacts.filter(
          (c) =>
            c.lifecycleStage === "lead" &&
            JSON.parse(c.tags).includes("enterprise")
        ).length,
      },
    }),
    prisma.segment.create({
      data: {
        name: "VIP Contacts",
        description: "High-value and VIP tagged contacts",
        filters: JSON.stringify([
          { field: "tags", operator: "contains", value: "vip" },
        ]),
        contactCount: contacts.filter((c) =>
          JSON.parse(c.tags).includes("vip")
        ).length,
      },
    }),
    prisma.segment.create({
      data: {
        name: "Churn Risk",
        description: "Contacts at risk of churning",
        filters: JSON.stringify([
          { field: "tags", operator: "contains", value: "churned-risk" },
        ]),
        contactCount: contacts.filter((c) =>
          JSON.parse(c.tags).includes("churned-risk")
        ).length,
      },
    }),
  ]);

  console.log(`Created ${segments.length} segments`);

  // Create campaigns
  const campaigns = await Promise.all([
    prisma.campaign.create({
      data: {
        name: "Q1 Product Launch",
        type: "email",
        status: "completed",
        subject: "Introducing Our Latest Features",
        body: "We're excited to announce our newest product updates that will transform your workflow...",
        segmentId: segments[0].id,
        sentAt: new Date("2026-01-15"),
        sent: 245,
        opens: 182,
        clicks: 67,
      },
    }),
    prisma.campaign.create({
      data: {
        name: "Enterprise Outreach",
        type: "email",
        status: "active",
        subject: "Exclusive Enterprise Solutions",
        body: "As a valued enterprise prospect, we'd like to offer you a personalized demo...",
        segmentId: segments[1].id,
        sentAt: new Date("2026-03-20"),
        sent: 89,
        opens: 54,
        clicks: 23,
      },
    }),
    prisma.campaign.create({
      data: {
        name: "VIP Appreciation",
        type: "email",
        status: "completed",
        subject: "Thank You for Being a VIP",
        body: "As one of our most valued customers, we want to show our appreciation...",
        segmentId: segments[2].id,
        sentAt: new Date("2026-02-14"),
        sent: 156,
        opens: 134,
        clicks: 89,
      },
    }),
    prisma.campaign.create({
      data: {
        name: "Win-Back Campaign",
        type: "sms",
        status: "draft",
        subject: "We Miss You!",
        body: "It's been a while since we've heard from you. We have some exciting updates...",
        segmentId: segments[3].id,
      },
    }),
    prisma.campaign.create({
      data: {
        name: "March Newsletter",
        type: "email",
        status: "completed",
        subject: "Your Monthly Product Update",
        body: "Here's what's new this month at Campaign Manager...",
        segmentId: segments[0].id,
        sentAt: new Date("2026-03-01"),
        sent: 312,
        opens: 198,
        clicks: 76,
      },
    }),
  ]);

  console.log(`Created ${campaigns.length} campaigns`);
  console.log("Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
