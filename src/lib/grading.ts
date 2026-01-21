// Calcule la moyenne d'un tableau de notes
// On ignore les null/undefined
export function calculateAverage(values: (number | null | undefined)[]): number | null {
  const validGrades = values.filter((v): v is number => v !== null && v !== undefined);
  
  if (validGrades.length === 0) return null;

  const sum = validGrades.reduce((a, b) => a + b, 0);
  return Math.round(sum / validGrades.length);
}

// Génère une couleur selon la note (Rouge -> Vert)
export function getScoreColor(score: number | null) {
  if (score === null) return "text-slate-400 bg-slate-100 border-slate-200";
  if (score < 50) return "text-red-700 bg-red-100 border-red-200";
  if (score < 80) return "text-orange-700 bg-orange-100 border-orange-200";
  return "text-green-700 bg-green-100 border-green-200";
}