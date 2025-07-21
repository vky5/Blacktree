export function StatusDot({ status }: { status: "building" | "active" | "failed" }) {
  const colorMap = {
    building: "#facc15", // yellow-400
    active: "#33CF96",
    failed: "#f87171", // red-400
  };

  const isPulsing = status === "building" || status === "active";

  return (
    <div className="relative w-3 h-3">
      {isPulsing && (
        <div
          className="absolute inset-0 rounded-sm opacity-75 animate-ping"
          style={{ backgroundColor: colorMap[status] }}
        />
      )}
      <div
        className="relative w-3 h-3 rounded-sm"
        style={{ backgroundColor: colorMap[status] }}
      />
    </div>
  );
}
