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
		<div className="grid grid-cols-1 lg:grid-cols-[366px_1fr] gap-0">
			{/* Desktop Sidebar */}
			<aside className="bg-white overflow-hidden hidden lg:block">
				{sidebar}
			</aside>

			{/* Content */}
			<section className="relative overflow-x-hidden">
				{/* Mobile header with hamburger */}
				<div className="lg:hidden w-full flex items-center justify-between px-4 pt-4 pb-2">
					<img
						src={require('../../assets/images/Carriya logo 1.png')}
						alt="Carriya"
						className="h-[29px] w-auto rounded"
					/>
					<button
						aria-label="Open menu"
						onClick={() => setMenuOpen(true)}
						className="p-2"
					>
						<img
							src={require('../../assets/images/Seller/hamberger.png')}
							alt="menu"
							className="w-4 h-4"
							style={{ filter: 'brightness(0) saturate(100%)' }}
						/>
					</button>
				</div>

				{header ? (
					<div className=" rounded-[25px] overflow-hidden mb-3">
						{header}
					</div>
				) : null}
				{children}
			</section>

			{/* Mobile full-screen menu overlay (match seller dashboard style) */}
			{menuOpen ? (
				<div
					className="lg:hidden fixed inset-0 z-50 bg-white overflow-hidden h-screen w-screen flex flex-col"
					role="dialog"
					aria-modal="true"
					onWheel={(e) => { e.preventDefault(); }}
					onTouchMove={(e) => { e.preventDefault(); }}
					style={{ touchAction: 'none', overscrollBehavior: 'none' }}
				>
					{/* Top bar */}
					<div className="flex items-center justify-between px-4 pt-5 pb-3 border-b border-[#E5E7EB]">
						{/* Single logo shown here; sidebar hides its own logo in mobile mode */}
						<img src={require('../../assets/images/Carriya logo 1.png')} alt="Carriya" className="h-[29px] w-auto rounded" />
						<div className="flex items-center gap-3">
							{/* <img src={require('../../assets/images/Seller/rightTop.png')} alt="right-top" className="w-5 h-5" />
							<img src={require('../../assets/images/Seller/rightBottom.png')} alt="right-bottom" className="w-5 h-5" /> */}
							<button aria-label="Close menu" className="p-2" onClick={() => setMenuOpen(false)}>
								<span className="block w-4 h-4" style={{ position: 'relative' }}>
									<span className="absolute inset-0 rotate-45 bg-black" style={{ height: 2, top: '50%' }} />
									<span className="absolute inset-0 -rotate-45 bg-black" style={{ height: 2, top: '50%' }} />
								</span>
							</button>
						</div>
					</div>
					{/* Menu content */}
					<div className="p-4 flex-1 overflow-hidden">
						{/* Inject sidebar with mobile styling */}
						{React.isValidElement(sidebar) ? React.cloneElement(sidebar as any, { isMobile: true }) : sidebar}
					</div>
				</div>
			) : null}
		</div>
	);
};

export default AdminLayout;


