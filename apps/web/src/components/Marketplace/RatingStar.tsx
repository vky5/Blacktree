export function RatingStar({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-white font-medium">{rating.toFixed(1)}</span>
      <span className="text-emerald">★</span>
    </div>
  );
}

