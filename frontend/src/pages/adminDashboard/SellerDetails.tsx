import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminTopGreenHeader from '../../components/admin/AdminTopGreenHeader';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Footer from '../../components/Footer';
import uploadImage from '../../assets/images/auth/Upload.png';
import { fetchNewSellers } from '../../services/adminService';
import { AdminSellerDetails } from '../../types/admin';

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<p
		className="text-black font-semibold text-[15px] md:text-[35px]"
		style={{ fontFamily: 'Roboto', lineHeight: '1.171875em' }}
	>
		{children}
	</p>
);

const ValueCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
	<div
		className={[
			'bg-white rounded-[10px] border',
			'border-[#E2E0E0]',
			'shadow-[2px_3px_4px_rgba(46,204,113,0.25)]',
			'flex items-center',
			className || ''
		].join(' ')}
	>
		<div className="px-4 md:px-7 py-3 md:py-5 w-full">
			<p className="text-black font-medium text-[15px] md:text-[25px]" style={{ fontFamily: 'Roboto', lineHeight: '1.171875em' }}>
				{children}
			</p>
		</div>
	</div>
);
const InputCard: React.FC<{
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    className?: string;
}> = ({ value, onChange, placeholder, className }) => (
	<div
		className={[
			'bg-white rounded-[10px] border',
			'border-[#E2E0E0]',
			'shadow-[2px_3px_4px_rgba(46,204,113,0.25)]',
			'flex items-center',
			className || ''
		].join(' ')}
	>
        <input
			type="text"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
            className="w-full h-full px-4 md:px-7 py-3 md:py-5 text-black placeholder-[#B8B1B1] focus:outline-none font-medium text-[15px] md:text-[25px]"
			style={{ fontFamily: 'Roboto', lineHeight: '1.171875em', borderRadius: 10 }}
            readOnly
            // disabled
		/>
	</div>
);

const UploadCard: React.FC<{ label: string; onChange?: (file: File) => void }> = ({ label, onChange }) => (
    <div className="relative" style={{ width: 273.02, height: 128 }}>
		{/* Outer rectangle: 273.02x128, 1.5px border #B8B1B1, radius 20 */ }
		<div className="absolute  bg-white inset-0 rounded-[20px]" style={{ borderColor: '#B8B1B1', borderWidth: 1.5, borderStyle: 'solid' }} />
		{/* Inner rectangle: positioned at x:59, y:16 with size 154x80, 1px border #2ECC71, radius 25 */}
		<div className="absolute rounded-[25px] flex items-center justify-center" style={{ left: 59, top: 16, width: 154, height: 80, borderColor: '#2ECC71', borderWidth: 1, borderStyle: 'solid' }}>
			{/* Icon frame: ~centered within inner rect; image colored green as in figma */}
			<div style={{ width: 70.79, height: 71.82 }} className="flex items-center justify-center">
				<img src={uploadImage} alt="Upload" />
			</div>
		</div>
		{/* Label text inside group: positioned at x:107, y:101; Roboto 20, color #B8B1B1 */}
		<p className="absolute" style={{ left: 107, top: 101, fontFamily: 'Roboto', fontWeight: 400, fontSize: 20, color: '#B8B1B1' }}>{label}</p>
		{/* Transparent input overlay */}
		<input
			type="file"
			accept="image/*"
			onChange={(e) => {
				if (e.target.files && e.target.files[0]) {
					onChange && onChange(e.target.files[0]);
				}
			}}
            className="absolute inset-0 w-full h-full opacity-0"
            disabled
            aria-disabled="true"
		/>
	</div>
);

const SellerDetails: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [seller, setSeller] = useState<AdminSellerDetails | undefined>(undefined);
	const [form, setForm] = useState({
		firstName: '',
		lastName: '',
		phone: '',
		email: '',
		company: '',
		pickupAddress: '',
		returnAddress: '',
		nameOnId: '',
		idCardNumber: '',
		iban: '',
		accountNumber: '',
		bankName: '',
		branchCode: ''
	});

	useEffect(() => {
		const ac = new AbortController();
		fetchNewSellers(ac.signal).then((list) => {
			const base = list.find((s) => s.id === id);
			if (base) {
		
				setSeller({
					...base,
					phone: '+92 321 1234569',
					email: 'Hismail@gmail.com',
					company: 'ABC Limited',
					pickupAddress: 'His pick up address',
					returnAddress: 'His Return address',
					idCardNumber: '35303-******-*',
					iban: 'PK838239020388383',
					accountNumber: 'PK838239020388383',
					bankName: 'HBL Bank',
					branchCode: '4455'
				});
			}
		});
		return () => ac.abort();
	}, [id]);

	useEffect(() => {
		if (seller) {
			setForm({
				firstName: seller.firstName || '',
				lastName: seller.lastName || '',
				phone: seller.phone || '',
				email: seller.email || '',
				company: seller.company || '',
				pickupAddress: seller.pickupAddress || '',
				returnAddress: seller.returnAddress || '',
				nameOnId: `${seller.firstName || ''} ${seller.lastName || ''}`.trim(),
				idCardNumber: seller.idCardNumber || '',
				iban: seller.iban || '',
				accountNumber: seller.accountNumber || '',
				bankName: seller.bankName || '',
				branchCode: seller.branchCode || ''
			});
		}
	}, [seller]);

	return (
		<div className="min-h-screen bg-white lg:bg-[#F0FFF7]">
			<AdminTopGreenHeader />
			<AdminLayout
				sidebar={<AdminSidebar activeKey="new-sellers" topLogoSrc={require('../../assets/images/Carriya logo 1.png')} bottomLogoSrc={require('../../assets/images/Carriya logo 1.png')} onMenuClick={(key) => {
				if (key === 'new-sellers') navigate('/admin/dashboard');
				if (key === 'edit-content') navigate('/admin/edit-content');
			}} />}
			>
				<div className="px-4 md:px-6 pb-10">
					{/* Breadcrumbs & pill are already represented in sidebar header; omit in content to fit width */}

					{/* Form area positioned coordinates */}
					<div className="mt-8 md:px-0 px-3 md:mt-[40px] md:ml-[66px] md:mr-[40px] space-y-6 md:space-y-7">
						{/* Row: First Name / Last Name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-[48px]">
							<div>
								<Label>First Name</Label>
                                <div className="mt-3 md:mt-[26px] h-[56px] md:h-[80px] w-full md:w-[338px]">
									<InputCard className="h-full w-full" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} placeholder="Enter first name" />
								</div>
							</div>
							<div>
								<Label>Last Name</Label>
                                <div className="mt-3 md:mt-[26px] h-[56px] md:h-[80px] w-full md:w-[338px]">
									<InputCard className="h-full w-full" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} placeholder="Enter last name" />
								</div>
							</div>
						</div>

						{/* Row: Contact / Email */}
                        <div className="mt-6 md:mt-[42px] grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-[70px]">
							<div>
								<Label>Contact</Label>
                                <div className="mt-3 md:mt-[26px] h-[56px] md:h-[80px] w-full md:w-[338px]">
									<InputCard className="h-full w-full" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="Enter phone number" />
								</div>
							</div>
							<div>
								<Label>Email</Label>
                                <div className="mt-3 md:mt-[26px] h-[56px] md:h-[80px] w-full md:w-[400px]">
									<InputCard className="h-full w-full" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="Enter email" />
								</div>
							</div>
						</div>

						{/* Company Name */}
                        <div className="mt-6 md:mt-[42px]">
							<Label>Company Name</Label>
                            <div className="mt-3 md:mt-[26px] h-[56px] md:h-[80px] w-full md:w-[338px]">
								<InputCard className="h-full w-full" value={form.company} onChange={(v) => setForm({ ...form, company: v })} placeholder="Enter company name" />
							</div>
						</div>

						{/* Addresses */}
						<div className="mt-6 md:mt-[51px]">
							<Label>Pick Up Address</Label>
							<div className="mt-3 h-[56px] md:h-[80px] w-full md:w-[933px]">
								<InputCard className="h-full w-full md:w-[830px]" value={form.pickupAddress} onChange={(v) => setForm({ ...form, pickupAddress: v })} placeholder="Enter pick up address" />
							</div>
						</div>
						<div className="mt-6 md:mt-[51px]">
							<Label>Return Address</Label>
							<div className="mt-3 h-[56px] md:h-[80px] w-full md:w-[933px]">
								<InputCard className="h-full w-full md:w-[830px]" value={form.returnAddress} onChange={(v) => setForm({ ...form, returnAddress: v })} placeholder="Enter return address" />
							</div>
						</div>

						{/* ID and Verification */}
                        <div className="mt-6 md:mt-[60px] grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-[50px]">
							<div>
								<Label>Name On ID Card</Label>
                                <div className="mt-3 md:mt-[26px] h-[56px] md:h-[80px] w-full md:w-[441px]">
									<InputCard className="h-full w-full md:w-[338px]" value={form.nameOnId} onChange={(v) => setForm({ ...form, nameOnId: v })} placeholder="Enter name on ID" />
								</div>
							</div>
							<div>
								<Label>Id Card Number</Label>
                                <div className="mt-3 md:mt-[26px] h-[56px] md:h-[80px] w-full md:w-[441px]">
									<InputCard className="h-full w-full md:w-[400px]" value={form.idCardNumber} onChange={(v) => setForm({ ...form, idCardNumber: v })} placeholder="Enter ID card number" />
								</div>
							</div>
						</div>

					<div className="mt-6 md:mt-[26px] grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-[50px] md:gap-y-[20px]">
							<div>
								<Label>ID Card Front Pic</Label>
							<div className="mt-3 md:mt-[26px]"><UploadCard label="Id card" /></div>
							</div>
							<div>
								<Label>ID Card Back Pic</Label>
							<div className="mt-3 md:mt-[26px]"><UploadCard label="Id card" /></div>
							</div>
						</div>

						{/* Account Details */}
						<div className="mt-6 md:mt-[59px]">
							<Label>Account Details</Label>
							<div className="mt-3 md:mt-[26px] space-y-3 md:space-y-[26px] w-full md:w-[933px]">
								<InputCard className="h-[56px] md:h-[80px] w-full md:w-[830px]" value={form.nameOnId} onChange={(v) => setForm({ ...form, nameOnId: v })} placeholder="Enter account holder name" />
								<InputCard className="h-[56px] md:h-[80px] w-full md:w-[830px]" value={form.iban} onChange={(v) => setForm({ ...form, iban: v })} placeholder="Enter IBAN" />
								<InputCard className="h-[56px] md:h-[80px] w-full md:w-[830px]" value={form.accountNumber} onChange={(v) => setForm({ ...form, accountNumber: v })} placeholder="Enter account number" />
								<InputCard className="h-[56px] md:h-[80px] w-full md:w-[830px]" value={form.bankName} onChange={(v) => setForm({ ...form, bankName: v })} placeholder="Enter bank name" />
								<InputCard className="h-[56px] md:h-[80px] w-full md:w-[830px]" value={form.branchCode} onChange={(v) => setForm({ ...form, branchCode: v })} placeholder="Enter branch code" />
							</div>
						</div>

						{/* Bank document */}
						<div className="mt-6 md:mt-[51px]">
							<Label>Bank Document pic</Label>
						<div className="mt-3 md:mt-[26px]"><UploadCard label="Bank pic" /></div>
						</div>

						{/* Actions */}
						<div className="mt-10 md:mt-[122px] flex flex-col md:flex-row md:justify-between md:items-center gap-4">
							<button onClick={() => navigate(-1)} className="text-[#2ECC71] font-medium text-[16px] md:text-[20px]">Back</button>
							<div className="flex-1 md:flex-none">
								<button className="w-full md:w-[354px] h-[48px] md:h-[63px] bg-[#FF0000] rounded-[12px] md:rounded-[25px] text-white font-semibold text-[18px] md:text-[35px]">Suspend</button>
							</div>
						</div>
					</div>
				</div>
			</AdminLayout>
			<Footer />
		</div>
	);
};

export default SellerDetails;


