import React from 'react';

const AdminTopGreenHeader: React.FC = () => {
	return (
		<div className="w-full flex items-center justify-center md:h-[64px] h-[38px]" style={{ backgroundColor: '#2ECC71' }}>
			<span className="text-white md:text-[25px] text-[14px]" style={{ fontFamily: 'Roboto', fontWeight: 600 }}>
				Carryia Admin Panel
			</span>
		</div>
	);
};

export default AdminTopGreenHeader;


