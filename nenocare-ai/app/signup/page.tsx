import { createPatientAccount } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-lg">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Create Patient Account</CardTitle>
            <p className="text-sm text-mutedForeground">
              Start your recovery journey with NeroCare AI.
            </p>
          </CardHeader>
          <CardContent>
            <form action={createPatientAccount} className="grid gap-4">
              <input
                name="displayName"
                placeholder="Full name"
                className="h-11 rounded-md border border-white/10 bg-white/5 px-3"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                className="h-11 rounded-md border border-white/10 bg-white/5 px-3"
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
                className="h-11 rounded-md border border-white/10 bg-white/5 px-3"
              />
              <Button type="submit">Create account</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
