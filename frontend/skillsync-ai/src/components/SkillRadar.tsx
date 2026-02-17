"use client";

import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

type Props = {
  matchedCount: number;
  missingCount: number;
};

export function SkillRadar({ matchedCount, missingCount }: Props) {
  const total = matchedCount + missingCount || 1;
  const coverage = Math.round((matchedCount / total) * 100);

  const data = {
    labels: ["Coverage", "Gaps"],
    datasets: [
      {
        label: "Skill coverage",
        data: [coverage, 100 - coverage],
        backgroundColor: "rgba(129, 140, 248, 0.3)",
        borderColor: "rgba(129, 140, 248, 1)",
        borderWidth: 1,
        pointBackgroundColor: "rgba(248, 250, 252, 1)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          display: false,
        },
        grid: {
          color: "rgba(148, 163, 184, 0.25)",
        },
        angleLines: {
          color: "rgba(148, 163, 184, 0.25)",
        },
        pointLabels: {
          color: "rgba(148, 163, 184, 0.9)",
          font: {
            size: 10,
          },
        },
      },
    },
  } as const;

  return (
    <div className="relative">
      <Radar data={data} options={options} />
    </div>
  );
}
