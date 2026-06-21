import React from 'react';

const AdminTopGreenHeader: React.FC = () => {
	return (
		// Hide on mobile (lg:flex), show only on desktop
		<div className="hidden lg:flex w-full items-center justify-center h-[64px]" style={{ backgroundColor: '#2ECC71' }}>
			<span className="text-white text-[25px]" style={{ fontFamily: 'Roboto', fontWeight: 600 }}>
				Carriya Admin Panel
			</span>
		</div>
	);
};

export default AdminTopGreenHeader;


