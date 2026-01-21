"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  data: { subject: string; score: number; fullTitle: string }[];
};

export function CompetenceRadar({ data }: Props) {
  if (data.length === 0) return null;

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Profil de Compétences</CardTitle>
        <CardDescription>Moyenne par Pôle (Temps réel)</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            
            <Radar
              name="Moyenne"
              dataKey="score"
              stroke="#2563eb" // Couleur Primary (Blue)
              fill="#2563eb"
              fillOpacity={0.6}
            />
            <Tooltip 
              formatter={(value: number) => [`${value}/100`, "Moyenne"]}
              labelFormatter={(label) => data.find(d => d.subject === label)?.fullTitle || label}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}