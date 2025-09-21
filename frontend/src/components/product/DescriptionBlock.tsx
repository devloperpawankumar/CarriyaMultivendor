import React from 'react';

const DescriptionBlock: React.FC<{ text: string }> = ({ text }) => (
  <section className="mt-8">
    <h2 className="text-[30px] font-normal text-[#2ECC71] mb-6">Description</h2>
    <div className="text-[20px] font-light text-[#665345] leading-[1.21] whitespace-pre-line mb-4">
      {text}
    </div>
    <button className="text-[15px] font-medium text-[#2ECC71] hover:underline">Read more</button>
  </section>
);

export default DescriptionBlock;


