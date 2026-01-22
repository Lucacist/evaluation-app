import { calculateAverage } from "./grading";

// Cette fonction transforme les données brutes en données pour le graphique
export function computePoleAverages(referential: any[], grades: Record<number, number>) {
  return referential.map((pole) => {
    // 1. Récupérer toutes les notes de ce pôle
    const poleGrades: number[] = [];
    
    pole.activities.forEach((activity: any) => {
      activity.blocks.forEach((block: any) => {
        block.criteria.forEach((criterion: any) => {
          const val = grades[criterion.id];
          if (val !== undefined && val !== null) {
            poleGrades.push(val);
          }
        });
      });
    });

    // 2. Calculer la moyenne
    const avg = calculateAverage(poleGrades) || 0;

    // 3. Retourner le format attendu par Recharts
    return {
      subject: `Pôle ${pole.order}`, // ou pole.title (mais attention si c'est trop long)
      fullTitle: pole.title,
      score: avg,
      fullMark: 100,
    };
  });
}

export function prepareComparisonData(referential: any[], assessmentsWithGrades: any[]) {
  const chartData: any[] = [];

  // 1. On parcourt toute la hiérarchie pour lister les BLOCS (l'axe Y)
  referential.forEach(pole => {
    pole.activities.forEach((activity: any) => {
      activity.blocks.forEach((block: any) => {
        
        // On crée la ligne pour ce bloc
        const row: any = {
          name: `${block.code} - ${block.title.substring(0, 40)}${block.title.length > 40 ? '...' : ''}`,
          fullTitle: `${activity.code} > ${block.code} - ${block.title}`, // Pour le tooltip
          blockId: block.id
        };

        // 2. Pour chaque bilan, on calcule la moyenne de ce BLOC précis
        assessmentsWithGrades.forEach(assessment => {
          
          // On récupère les IDs des critères de ce bloc
          const blockCriteriaIds = new Set<number>();
          block.criteria.forEach((c: any) => blockCriteriaIds.add(c.id));

          // On cherche les notes correspondantes dans ce bilan
          const relevantGrades: number[] = [];
          assessment.grades.forEach((g: any) => {
            if (blockCriteriaIds.has(g.criterionId) && g.value !== null) {
              relevantGrades.push(g.value);
            }
          });

          // Calcul de la moyenne
          if (relevantGrades.length > 0) {
            const sum = relevantGrades.reduce((a, b) => a + b, 0);
            row[`assessment_${assessment.id}`] = Math.round(sum / relevantGrades.length);
          } else {
            row[`assessment_${assessment.id}`] = 0;
          }
        });

        chartData.push(row);
      });
    });
  });

  return chartData;
}

export function prepareRadarData(referential: any[], assessments: any[]) {
  if (!referential || !assessments) return [];

  return referential.map((pole) => {
    // 1. Récupérer tous les IDs de critères appartenant à ce pôle
    const poleCriteriaIds = new Set<number>();
    
    // On parcourt toute la hiérarchie du pôle pour trouver les IDs des critères
    pole.activities?.forEach((activity: any) => {
      activity.blocks?.forEach((block: any) => {
        block.criteria?.forEach((criterion: any) => {
          poleCriteriaIds.add(criterion.id);
        });
      });
    });

    // 2. Trouver toutes les notes de l'élève qui correspondent à ces critères
    let totalScore = 0;
    let count = 0;

    assessments.forEach((assessment: any) => {
      assessment.grades?.forEach((grade: any) => {
        if (poleCriteriaIds.has(grade.criterionId)) {
          totalScore += grade.value;
          count++;
        }
      });
    });

    // 3. Calculer la moyenne
    const average = count > 0 ? Math.round(totalScore / count) : 0;

    // 4. Formater pour le graphique
    return {
      subject: `Pôle ${pole.order}`, // Axe du graphique (ex: Pôle 1)
      fullTitle: pole.title,         // Titre complet pour le survol
      A: average,                    // La moyenne
      fullMark: 100,
    };
  });
}