import React from 'react';
import Stars from './Stars';

const ReviewsBlock: React.FC<{ items: Array<{ user: string; rating: number; text: string }>} > = ({ items }) => (
  <section className="mt-8">
    <div className="space-y-6">
      {items.map((r, idx) => (
        <div key={idx} className="border border-[#2ECC71] rounded-[10px] p-6 relative">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[16px] font-semibold text-[#2ECC71]">{r.user}</div>
            <div className="flex items-center gap-1">
              <Stars rating={r.rating} size="sm" />
              {/* <span className="text-[12px] text-[#949494]">({r.rating})</span> */}
            </div>
          </div>
          <p className="text-[12px] font-normal text-[#665345] leading-[1.3]">{r.text}</p>
        </div>
      ))}
      <div className="flex justify-end">
        <button className="bg-[#2ECC71] text-white rounded-[10px] px-5 py-2 text-[15px] font-bold">See more</button>
      </div>
    </div>
  </section>
);

export default ReviewsBlock;


