import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminTopGreenHeader from '../../components/admin/AdminTopGreenHeader';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Footer from '../../components/Footer';
import searchIcon from '../../assets/images/searchicon.png';
import { fetchNewSellers } from '../../services/adminService';
import { AdminSeller } from '../../types/admin';

const AdminDashboard: React.FC = () => {
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [sellers, setSellers] = useState<AdminSeller[]>([]);
    const navigate = useNavigate();
    useEffect(() => {
        const ac = new AbortController();
        setLoading(true);
        fetchNewSellers(ac.signal)
            .then(setSellers)
            .finally(() => setLoading(false));
        return () => ac.abort();
    }, []);
    const activeKey =
        location.pathname.includes('/admin/edit-content') ? 'edit-content' :
        location.pathname.includes('/admin/transactions') ? 'see-transaction' :
        'new-sellers';
	return (
		<div className="min-h-screen bg-white lg:bg-[#F0FFF7]">
			<AdminTopGreenHeader />
            <AdminLayout
                sidebar={<AdminSidebar 
                    topLogoSrc={require('../../assets/images/Carriya logo 1.png')}
                    bottomLogoSrc={require('../../assets/images/Carriya logo 1.png')}
                    activeKey={activeKey}
                    onMenuClick={(key) => {
                        if (key === 'new-sellers') navigate('/admin/dashboard');
                        if (key === 'edit-content') navigate('/admin/edit-content');
                        if (key === 'see-transaction') navigate('/admin/transactions');
                    }}
                />}
				header={(
					<div className="w-full h-[120px] md:h-[150px] flex items-center px-4 md:px-6">
						<div
							className="w-full flex items-center bg-white rounded-[12px] md:rounded-[15px]"
							style={{
								maxWidth: 971,
								height: 56,
								borderWidth: 1.5,
								borderStyle: 'solid',
								borderColor: '#DADADA',
								boxShadow: '2px 2px 5px 0px rgba(246, 246, 246, 1)',
								paddingLeft: 14,
								paddingRight: 12
							}}
						>
							<input
								type="text"
								placeholder="Search For Sellers"
								className="flex-1 outline-none "
								style={{ color: '#A9A9A9', fontFamily: 'Roboto', fontWeight: 500, fontSize: 16 }}
							/>
							<div
								className="flex items-center justify-center bg-[#2ECC71] rounded-[10px]"
								style={{ width: 48, height: 42, marginLeft: 'auto' }}
							>
								<img src={searchIcon} alt="Search" style={{ width: 28, height: 28, objectFit: 'contain' }} />
							</div>
						</div>
					</div>
				)}
			>
				<div className="px-4 md:px-6 pb-10">
					<div className="grid gap-4 md:gap-[31px]">
						{(loading ? [] : sellers).map((seller) => (
							<div
								key={seller.id}
								className="w-full max-w-[982px] bg-white rounded-[12px] md:rounded-[10px] border border-[#E5E7EB] md:border-transparent shadow-sm md:shadow-none flex md:flex-row flex-col md:items-center"
								style={{ padding: 16 }}
							>
								<div className="flex items-center md:items-center gap-3 md:gap-6">
									<div className="hidden md:block text-[15px] font-medium text-black">New Seller</div>
									<div className="md:ml-0 text-[16px] md:text-[15px] text-black font-semibold">{seller.firstName} {seller.lastName}</div>
								</div>
								<div className="mt-3 md:mt-0 md:ml-auto flex">
									<button
										onClick={() => navigate(`/admin/sellers/${seller.id}`)}
										className="bg-[#2ECC71] text-white rounded-[8px] md:rounded-[5px] font-medium flex items-center justify-center w-full md:w-[177px] h-[40px] md:h-[36px] text-[16px] md:text-[20px]"
									>
										See Details
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			</AdminLayout>
			<Footer />
		</div>
	);
};

export default AdminDashboard;


