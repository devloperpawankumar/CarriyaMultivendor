import React from 'react';
import { DateRange } from '../types/reportTypes';

type Props = {
  selected: DateRange | string;
  onChange: (range: DateRange | string) => void;
};

const ranges: (DateRange | string)[] = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month'];

const FiltersBar: React.FC<Props> = ({ selected, onChange }) => {
  return (
    <div className="bg-green-50 rounded-[25px] inline-block px-4 py-2">
      <div className="flex gap-3 flex-wrap">
        {ranges.map(r => (
          <button
            key={r}
            onClick={() => onChange(r)}
            className={
              'text-[16px] md:text-[18px] font-medium rounded-full px-3 py-1 ' +
              (selected === r ? 'bg-white text-black' : 'text-black/80')
            }
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FiltersBar;



