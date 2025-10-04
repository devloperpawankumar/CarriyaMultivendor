import React from 'react';
import { Demographics } from '../types/reportTypes';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

type Props = { data: Demographics };

const DemographicsCard: React.FC<Props> = ({ data }) => {
  const genderData = [
    { name: 'Male', value: Math.max(0, Math.min(100, data.genderSplit.malePercent)) },
    { name: 'Female', value: Math.max(0, Math.min(100, data.genderSplit.femalePercent)) },
  ];

  const ageData = data.ageBands.map((a) => ({
    band: a.band,
    male: Math.max(0, Math.min(100, a.male)),
    female: Math.max(0, Math.min(100, a.female)),
  }));

  const cityData = data.locations.map((l) => ({
    city: l.city,
    primary: Math.max(0, Math.min(100, l.primaryBar)),
    secondary: Math.max(0, Math.min(100, l.secondaryBar)),
  }));

  return (
    <div className="bg-white rounded-[19px] p-5 border border-gray-100">
      <div className="text-[#05004E] text-[12px] font-semibold mb-3">{data.title}</div>

      <div className="flex items-center gap-3 mb-3">
        <span className="w-2.5 h-2.5 rounded-full bg-[#2ECC71] inline-block" />
        <span className="text-[10px]">Male</span>
        <span className="w-2.5 h-2.5 rounded-full bg-[#C7FFDF] inline-block ml-4" />
        <span className="text-[10px]">Female</span>
      </div>

      {/* Gender concentric radial donut */}
      <div className="mb-4">
        <ResponsiveContainer width="100%" height={114}>
          <PieChart>
            {/* Outer ring: Male track + progress */}
            <Pie
              data={[
                { name: 'Male', value: genderData[0].value },
                { name: 'Remaining', value: 100 - genderData[0].value },
              ]}
              dataKey="value"
              nameKey="name"
              innerRadius={38}
              outerRadius={56}
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              stroke="none"
            >
              <Cell fill="#2ECC71" />
              <Cell fill="#F2F3F9" />
            </Pie>
            {/* Inner ring: Female track + progress */}
            <Pie
              data={[
                { name: 'Female', value: genderData[1].value },
                { name: 'Remaining', value: 100 - genderData[1].value },
              ]}
              dataKey="value"
              nameKey="name"
              innerRadius={20}
              outerRadius={32}
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              stroke="none"
            >
              <Cell fill="#C7FFDF" />
              <Cell fill="#F6F7FB" />
            </Pie>
            <Tooltip formatter={(v: number) => `${v}%`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Age distribution grouped bars (thicker bars */}
      <div className="mb-4 md:mt-8" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ageData} margin={{ top: 0, right: 8, left: 0, bottom: 0 }} barCategoryGap="20%">
            <CartesianGrid stroke="#E6E6E6" strokeDasharray="0" vertical={false} />
            <XAxis dataKey="band" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} hide />
            <Tooltip formatter={(v: number) => `${v}%`} cursor={{ fill: 'transparent' }} />
            <Bar dataKey="male" fill="#2ECC71" barSize={28} radius={[8, 8, 8, 8]} />
            <Bar dataKey="female" fill="#C7FFDF" barSize={28} radius={[8, 8, 8, 8]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[#05004E] mt-3 text-[12px]font-semibold mb-2">{data.topLocationsTitle}</div>
      {/* Location progress lines (no chart) */}
      <div className="space-y-3">
        {cityData.map((row) => (
          <div key={row.city} className="flex items-center gap-3">
            <div className="w-16 text-[10px] text-black truncate">{row.city}</div>
            <div className="flex-1 h-[6px] bg-[#E9FFF2] rounded-[8px] overflow-hidden">
              <div
                className="h-full bg-[#C7FFDF]"
                style={{ width: `${Math.max(0, Math.min(100, row.primary))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DemographicsCard;



