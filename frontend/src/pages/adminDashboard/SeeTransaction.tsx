import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminTopGreenHeader from '../../components/admin/AdminTopGreenHeader';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Footer from '../../components/Footer';
import searchIcon from '../../assets/images/searchicon.png';

const SeeTransaction: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-white lg:bg-[#F0FFF7]">
            <AdminTopGreenHeader />
            <AdminLayout
                sidebar={
                    <AdminSidebar
                        activeKey="see-transaction"
                        topLogoSrc={require('../../assets/images/Carriya logo 1.png')}
                        bottomLogoSrc={require('../../assets/images/Carriya logo 1.png')}
                        onMenuClick={(key) => {
                            if (key === 'new-sellers') navigate('/admin/dashboard');
                            if (key === 'edit-content') navigate('/admin/edit-content');
                            if (key === 'see-transaction') navigate('/admin/transactions');
                        }}
                    />
                }
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
                <div className="px-6 pb-10">
                    <div className="md:mt-6 mt-4" style={{ maxWidth: 800, marginLeft: 'auto', marginRight: 'auto' }}>
                        <div className="bg-white rounded-[25px] border border-[#B8B1B1] shadow-lg overflow-hidden w-full" role="table" aria-label="Transactions">
                            {/* Mobile cards (no horizontal scroll) */}
                            <div className="md:hidden">
                                <div className="bg-[rgba(46,204,113,0.17)] text-[#4C4C4C] font-extrabold px-4 h-10 flex items-center" role="rowgroup">
                                    <span className="text-[12px]">Transactions</span>
                                </div>
                                {Array.from({ length: 9 }).map((_, index) => {
                                    const shopNames = ['Shop A','Shop B','Shop C','Shop D','Shop E','Shop F','Shop G','Shop H','Shop I'];
                                    const isPending = [2,5,7].includes(index);
                                    const statusText = isPending ? 'Pending' : 'Completed';
                                    const pillBg = isPending ? 'rgba(229, 229, 35, 0.58)' : 'rgba(46, 204, 113, 0.36)';
                                    return (
                                        <div key={index} className="px-4 py-4 border-b border-[#B8B1B1]/70 last:border-b-0" role="row">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[14px] font-semibold text-black truncate" title={shopNames[index]}>
                                                        {shopNames[index]}
                                                    </div>
                                                    <div className="mt-1 text-[12px] text-[#6B7280]" aria-label="Date">28/09/2020</div>
                                                </div>
                                                <div aria-label="Status">
                                                    <div
                                                        className="rounded-[25px] flex items-center justify-center text-[11px] font-semibold text-black shadow-sm"
                                                        style={{ height: 24, paddingLeft: 10, paddingRight: 10, background: pillBg, minWidth: 78, width: 'fit-content' }}
                                                    >
                                                        {statusText}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                                                <div className="text-[#6B7280]">Commission</div>
                                                <div className="text-black font-semibold">50 PKR</div>
                                                <div className="text-[#6B7280]">Type</div>
                                                <div className="text-black font-semibold">Payout</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Desktop table */}
                            <div className="hidden md:block">
                            {(() => {
                                const gridTemplate = 'minmax(120px,0.9fr) minmax(160px,1.2fr) minmax(120px,0.9fr) minmax(120px,0.9fr) minmax(140px,1fr)';
                                return (
                                    <>
                                        <div
                                            className="bg-[rgba(46,204,113,0.17)] text-[#949494] font-extrabold"
                                            style={{ height: 51, display: 'grid', gridTemplateColumns: gridTemplate, alignItems: 'center', paddingLeft: 20, paddingRight: 20 }}
                                        >
                                            <div className="truncate">Date</div>
                                            <div className="truncate">Vendor</div>
                                            <div className="truncate">Commission</div>
                                            <div className="truncate">Type</div>
                                            <div className="truncate">Status</div>
                                        </div>

                                        {Array.from({ length: 9 }).map((_, index) => {
                                            const shopNames = ['Shop A','Shop B','Shop C','Shop D','Shop E','Shop F','Shop G','Shop H','Shop I'];
                                            const isPending = [2,5,7].includes(index);
                                            const statusText = isPending ? 'Pending' : 'Completed';
                                            const pillBg = isPending ? 'rgba(229, 229, 35, 0.58)' : 'rgba(46, 204, 113, 0.36)';
                                            return (
                                                <div
                                                    key={index}
                                                     className="bg-white hover:bg-[rgba(46,204,113,0.05)]"
                                                     style={{ height: 70, display: 'grid', gridTemplateColumns: gridTemplate, alignItems: 'center', paddingLeft: 20, paddingRight: 20, borderTop: '1px solid #B8B1B1', background: index % 2 === 1 ? 'rgba(46,204,113,0.02)' : 'white' }}
                                                >
                                                    <div className="text-[13px] font-semibold text-black truncate" title="28/09/2020">28/09/2020</div>
                                                    <div className="text-[13px] font-semibold text-black truncate" title={shopNames[index]}>{shopNames[index]}</div>
                                                    <div className="text-[13px] font-semibold text-black truncate" title="50 PKR">50 PKR</div>
                                                    <div className="text-[13px] font-semibold text-black truncate" title="Payout">Payout</div>
                                                    <div className="flex items-center">
                                                        <div
                                                            className="rounded-[25px] flex items-center justify-center text-[13px] font-semibold text-black"
                                                            style={{ height: 26, paddingLeft: 14, paddingRight: 14, background: pillBg, minWidth: 92, width: 'fit-content' }}
                                                        >
                                                            {statusText}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </>
                                );
                            })()}
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
            <Footer />
        </div>
    );
};

export default SeeTransaction;


