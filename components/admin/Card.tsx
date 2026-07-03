export default function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-zinc-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
