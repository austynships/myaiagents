import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Your front desk never misses a call again.
      </h1>
      <p className="max-w-md text-muted-foreground">
        Missed-Call Text-Back is coming soon. This is a placeholder page while
        we build Phase 0.
      </p>
      <Button disabled>Coming soon</Button>
    </main>
  );
}
