"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F"];

type Props = {
  data: any[]; 
  assessments: { id: number; title: string; status: string; date: Date }[];
};

export function ComparisonDashboard({ data, assessments }: Props) {
  const [selectedIds, setSelectedIds] = useState<number[]>(assessments.map(a => a.id));

  const handleToggle = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // CALCUL DYNAMIQUE DE LA HAUTEUR
  // On prévoit 60px par ligne (bloc) pour que ce soit aéré
  // On met un minimum de 400px
  const dynamicHeight = Math.max(400, data.length * 60);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* 1. PANNEAU DE CONTRÔLE */}
      <Card className="lg:col-span-1 h-fit sticky top-4">
        <CardHeader>
          <CardTitle>Sélection</CardTitle>
          <CardDescription>Cochez les bilans à comparer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {assessments.map((assessment, index) => (
            <div key={assessment.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`chk-${assessment.id}`} 
                checked={selectedIds.includes(assessment.id)}
                onCheckedChange={() => handleToggle(assessment.id)}
                className="data-[state=checked]:bg-primary"
                style={{ borderColor: COLORS[index % COLORS.length] }}
              />
              <Label htmlFor={`chk-${assessment.id}`} className="flex flex-col cursor-pointer">
                <span className="font-semibold">{assessment.title}</span>
                <span className="text-xs text-muted-foreground">
                  {assessment.status === "draft" ? "(Actuel)" : new Date(assessment.date).toLocaleDateString()}
                </span>
              </Label>
              {assessment.status === "draft" && <Badge variant="outline" className="text-xs">En cours</Badge>}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 2. LE GRAPHIQUE */}
      <Card className="lg:col-span-3 overflow-hidden">
        <CardHeader>
          <CardTitle>Évolution par Compétence</CardTitle>
          <CardDescription>Comparaison détaillée par bloc</CardDescription>
        </CardHeader>
        <CardContent>
          {/* On applique la hauteur dynamique ici */}
          <div style={{ height: `${dynamicHeight}px`, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={220} // Un peu plus large pour lire les titres des blocs
                  tick={{fontSize: 11}} 
                  interval={0}
                />
                
                <XAxis type="number" domain={[0, 100]} />
                
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  labelFormatter={(label) => data.find(d => d.name === label)?.fullTitle || label}
                />
                <Legend verticalAlign="top" height={36}/>

                {assessments.map((assessment, index) => (
                  <Bar 
                    key={assessment.id}
                    dataKey={`assessment_${assessment.id}`} 
                    name={assessment.title} 
                    fill={COLORS[index % COLORS.length]} 
                    hide={!selectedIds.includes(assessment.id)}
                    radius={[0, 4, 4, 0]}
                    barSize={12} // Barres plus fines car il y en a beaucoup
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}