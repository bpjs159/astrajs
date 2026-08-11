export interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
}

export function StatCard({ label, value, color }: StatCardProps): JSX.Element {
  return (
    <div class="stat-card">
      <div class="stat-value" style={color ? `color:${color}` : ''}>
        {value}
      </div>
      <div class="stat-label">{label}</div>
    </div>
  );
}
