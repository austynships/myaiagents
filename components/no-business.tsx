/** Shown to a signed-in account that isn't connected to any business. */
export function NoBusiness() {
  return (
    <div className="max-w-md space-y-2">
      <h1 className="text-xl font-semibold">No business linked yet</h1>
      <p className="text-sm text-muted-foreground">
        This account isn&apos;t connected to a business. If you expected to see
        your inbox, contact the person who invited you.
      </p>
    </div>
  );
}
