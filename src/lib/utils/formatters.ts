export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} mins`;
  }
  return `${hours.toFixed(1)} hrs`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatScore(score: number, maxScore: number = 100): string {
  return `${score.toFixed(1)} / ${maxScore}`;
}
