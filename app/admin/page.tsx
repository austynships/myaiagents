import { Suspense } from "react";
import { listBusinesses } from "@/lib/admin/businesses";

export default function AdminHome() {
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-semibold">Businesses</h1>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Loading businesses…</p>
        }
      >
        <BusinessList />
      </Suspense>
      <p className="text-sm text-muted-foreground">
        Adding and editing businesses comes in Task 0.5.
      </p>
    </div>
  );
}

async function BusinessList() {
  const businesses = await listBusinesses();

  if (businesses.length === 0) {
    return <p className="text-sm text-muted-foreground">No businesses yet.</p>;
  }
  return (
    <ul className="divide-y rounded-lg border">
      {businesses.map((b) => (
        <li key={b.id} className="flex items-center justify-between px-4 py-3">
          <span className="font-medium">{b.name}</span>
          <span className="text-sm text-muted-foreground">
            {b.numbers.join(", ") || "No number yet"}
          </span>
        </li>
      ))}
    </ul>
  );
}
