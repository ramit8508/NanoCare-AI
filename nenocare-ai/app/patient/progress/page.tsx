import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProgressChart from "./ProgressChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formatDate = (value: Date) =>
  value.toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default async function PatientProgressPage() {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    redirect("/login");
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const prismaAny = prisma as any;
  const records = (await prismaAny.exerciseSessionRecord.findMany({
    where: {
      patientId: session.userId,
      createdAt: { gte: sevenDaysAgo },
      accuracy: { not: null },
      maxAngle: { not: null },
    },
    orderBy: { createdAt: "asc" },
  })) as Array<any>;

  const buckets = new Map<string, { accuracySum: number; maxAngleSum: number; count: number }>();

  records.forEach((record) => {
    const date = formatDate(new Date(record.createdAt));
    const bucket = buckets.get(date) || { accuracySum: 0, maxAngleSum: 0, count: 0 };
    bucket.accuracySum += record.accuracy ?? 0;
    bucket.maxAngleSum += record.maxAngle ?? 0;
    bucket.count += 1;
    buckets.set(date, bucket);
  });

  const data = Array.from(buckets.entries()).map(([date, bucket]) => ({
    date,
    accuracy: Math.round(bucket.accuracySum / bucket.count),
    maxAngle: Math.round(bucket.maxAngleSum / bucket.count),
  }));

  return (
    <main className="px-6 py-8">
      <div className="max-w-5xl">
        <h1 className="text-3xl font-semibold">Your 7-Day Progress</h1>
        <p className="mt-2 text-sm text-mutedForeground">
          Accuracy vs Range of Motion (max angle).
        </p>
      </div>
      <Card className="glass card-lift mt-6">
        <CardHeader>
          <CardTitle>Recovery Momentum</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressChart data={data} />
        </CardContent>
      </Card>
    </main>
  );
}
