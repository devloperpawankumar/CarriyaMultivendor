import React from 'react';
import { useLocation } from 'react-router-dom';

type AdminLayoutProps = {
	sidebar: React.ReactNode;
	header?: React.ReactNode;
	children: React.ReactNode;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ sidebar, header, children }) => {
	const [menuOpen, setMenuOpen] = React.useState(false);
	const location = useLocation();

	React.useEffect(() => {
		// Close menu on route change for better UX
		setMenuOpen(false);
	}, [location.pathname]);

	React.useEffect(() => {
		// Disable body scroll when mobile menu is open (lock scroll position)
		const originalBodyOverflow = document.body.style.overflow;
		const originalHtmlOverflow = document.documentElement.style.overflow;
		const originalBodyPosition = document.body.style.position;
		const originalBodyTop = document.body.style.top;
		const originalBodyWidth = document.body.style.width;
		const originalOverscroll = (document.documentElement.style as any).overscrollBehavior;
		if (menuOpen) {
			const scrollY = window.scrollY || window.pageYOffset;
			document.body.style.overflow = 'hidden';
			document.documentElement.style.overflow = 'hidden';
			document.body.style.position = 'fixed';
			document.body.style.top = `-${scrollY}px`;
			document.body.style.width = '100%';
			(document.documentElement.style as any).overscrollBehavior = 'none';
		} else {
			const top = document.body.style.top;
			document.body.style.overflow = originalBodyOverflow || '';
			document.documentElement.style.overflow = originalHtmlOverflow || '';
			document.body.style.position = originalBodyPosition || '';
			document.body.style.top = originalBodyTop || '';
			document.body.style.width = originalBodyWidth || '';
			(document.documentElement.style as any).overscrollBehavior = originalOverscroll || '';
			if (top) {
				const y = parseInt(top.replace('-', '').replace('px', '')) || 0;
				window.scrollTo(0, y);
			}
		}
		return () => {
			document.body.style.overflow = originalBodyOverflow || '';
			document.documentElement.style.overflow = originalHtmlOverflow || '';
			document.body.style.position = originalBodyPosition || '';
			document.body.style.top = originalBodyTop || '';
			document.body.style.width = originalBodyWidth || '';
			(document.documentElement.style as any).overscrollBehavior = originalOverscroll || '';
		};
	}, [menuOpen]);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-[256px_1fr] gap-0">
			{/* Desktop Sidebar */}
			<aside className="bg-white overflow-hidden hidden lg:block">
				{sidebar}
			</aside>

		{/* Content */}
		<section className="relative overflow-x-hidden bg-white">
			{/* Mobile header with green bar, logo, and hamburger */}
			<div className="lg:hidden w-full">
				{/* Green bar - matches desktop AdminTopGreenHeader */}
				<div className="w-full flex items-center justify-center h-[48px]" style={{ backgroundColor: '#2ECC71' }}>
					<span className="text-white text-[16px] font-semibold" style={{ fontFamily: 'Roboto', fontWeight: 600 }}>
						Carriya Admin Panel
					</span>
				</div>
				
				{/* Logo and hamburger row */}
				<div className="w-full flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
					<img
						src={require('../../assets/images/Carriya logo 1.png')}
						alt="Carriya"
						className="h-[26px] w-auto"
					/>
					<button
						aria-label="Open menu"
						onClick={() => setMenuOpen(true)}
						className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
					>
						<svg 
							width="24" 
							height="24" 
							viewBox="0 0 24 24" 
							fill="none" 
							xmlns="http://www.w3.org/2000/svg"
							className="text-gray-700"
						>
							<path 
								d="M3 12h18M3 6h18M3 18h18" 
								stroke="currentColor" 
								strokeWidth="2" 
								strokeLinecap="round"
							/>
						</svg>
					</button>
				</div>
			</div>

				{header ? (
					<div className="overflow-hidden">
						{header}
					</div>
				) : null}
				{children}
			</section>

		{/* Mobile full-screen menu overlay */}
		{menuOpen ? (
			<div
				className="lg:hidden fixed inset-0 z-50 bg-white overflow-hidden h-screen w-screen flex flex-col"
				role="dialog"
				aria-modal="true"
				onWheel={(e) => { e.preventDefault(); }}
				onTouchMove={(e) => { e.preventDefault(); }}
				style={{ touchAction: 'none', overscrollBehavior: 'none' }}
			>
				{/* Green header bar in mobile menu */}
				<div className="w-full flex items-center justify-center h-[48px]" style={{ backgroundColor: '#2ECC71' }}>
					<span className="text-white text-[16px] font-semibold" style={{ fontFamily: 'Roboto', fontWeight: 600 }}>
						Carriya Admin Panel
					</span>
				</div>
				
				{/* Top bar with logo and close button */}
				<div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-white">
					<img 
						src={require('../../assets/images/Carriya logo 1.png')} 
						alt="Carriya" 
						className="h-[26px] w-auto" 
					/>
					<button 
						aria-label="Close menu" 
						className="p-2 hover:bg-gray-50 rounded-lg transition-colors" 
						onClick={() => setMenuOpen(false)}
					>
						<svg 
							width="20" 
							height="20" 
							viewBox="0 0 20 20" 
							fill="none" 
							xmlns="http://www.w3.org/2000/svg"
							className="text-gray-700"
						>
							<path 
								d="M15 5L5 15M5 5l10 10" 
								stroke="currentColor" 
								strokeWidth="2" 
								strokeLinecap="round"
							/>
						</svg>
					</button>
				</div>
				
				{/* Menu content */}
				<div className="p-4 flex-1 overflow-y-auto">
					{/* Inject sidebar with mobile styling */}
					{React.isValidElement(sidebar) ? React.cloneElement(sidebar as any, { isMobile: true }) : sidebar}
				</div>
			</div>
		) : null}
		</div>
	);
};

export default AdminLayout;


