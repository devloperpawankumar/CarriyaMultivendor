import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminTopGreenHeader from '../../components/admin/AdminTopGreenHeader';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Footer from '../../components/Footer';

const EditContent: React.FC = () => {
	const navigate = useNavigate();
	return (
		<div className="min-h-screen bg-white lg:bg-[#F0FFF7]">
			<AdminTopGreenHeader />
			<AdminLayout
				sidebar={
					<AdminSidebar
						activeKey="edit-content"
						topLogoSrc={require('../../assets/images/Carriya logo 1.png')}
						bottomLogoSrc={require('../../assets/images/Carriya logo 1.png')}
						onMenuClick={(key) => {
							if (key === 'new-sellers') navigate('/admin/dashboard');
							if (key === 'edit-content') navigate('/admin/edit-content');
						if (key === 'see-transaction') navigate('/admin/transactions');
						}}
					/>
				}
			>
				<div className="px-4 sm:px-6 pb-10 max-w-screen-lg mx-auto w-full">
					{/* Page header */}
					<div className="pt-6 sm:pt-10">
						<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Content Management</h1>
						{/* <p className="mt-2 text-sm sm:text-base text-gray-600">Quickly jump to edit site copy and policies. Optimized for speed and clarity.</p> */}
					</div>
					{/* Top green translucent pill */}
					{/* <div className="mt-[36px] ml-[43px] rounded-[25px]" style={{ width: 235, height: 54, background: 'rgba(46, 204, 113, 0.18)' }} /> */}

					{/* Actions card */}
					<div className="mt-6 sm:mt-10 bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
						<div className="p-4 sm:p-6">
							{/* Buttons per Figma with exact sizes, responsive for mobile */}
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-[50px] sm:gap-y-[28px]">
						<button
							onClick={() => navigate('/blog')}
							className="w-full sm:w-[324px] h-12 sm:h-[90px] bg-[#2ECC71] text-white rounded-[25px] flex items-center justify-center font-semibold text-xl sm:text-[35px] shadow hover:shadow-md hover:bg-[#29b866] active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 transition"
							style={{ fontFamily: 'Roboto' }}
						>
							Edit Blog
						</button>
						<button
							onClick={() => navigate('/about')}
							className="w-full sm:w-[324px] h-12 sm:h-[90px] bg-[#2ECC71] text-white rounded-[25px] flex items-center justify-center font-semibold text-xl sm:text-[35px] shadow hover:shadow-md hover:bg-[#29b866] active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 transition"
							style={{ fontFamily: 'Roboto' }}
						>
							Edit About Us
						</button>
						<button
							onClick={() => navigate('/privacy-policy')}
							className="w-full sm:w-[324px] h-12 sm:h-[90px] bg-[#2ECC71] text-white rounded-[25px] flex items-center justify-center font-semibold text-xl sm:text-[35px] shadow hover:shadow-md hover:bg-[#29b866] active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 transition"
							style={{ fontFamily: 'Roboto' }}
						>
							Edit Privacy Policy
						</button>
						<button
							onClick={() => navigate('/return-refund-policy')}
							className="w-full sm:w-[400px] h-12 sm:h-[90px] bg-[#2ECC71] text-white rounded-[25px] flex items-center justify-center font-semibold text-xl sm:text-[35px] shadow hover:shadow-md hover:bg-[#29b866] active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 transition"
							style={{ fontFamily: 'Roboto' }}
						>
								Edit Return and Refund 
						</button>
							</div>
						</div>
					</div>
				</div>
			</AdminLayout>
			<Footer />
		</div>
	);
};

export default EditContent;


