import React from 'react';

const inputBoxClass =
  'w-full max-w-[655px] h-[35px] rounded-[5px] border border-[#B8B1B1] shadow-[1px_2px_4px_rgba(233,255,242,1)] px-4 text-[11px] text-[#1F1F1F] bg-white outline-none placeholder-[#B8B1B1]';

const selectBoxClass =
  'w-full max-w-[655px] h-[41px] rounded-[5px] border border-[#B8B1B1] shadow-[1px_2px_4px_rgba(233,255,242,1)] px-4 text-[12px] text-[#1F1F1F] bg-white outline-none';

const provinces = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
];

const citiesByProvince: Record<string, string[]> = {
  Punjab: ['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan'],
  Sindh: ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana'],
  'Khyber Pakhtunkhwa': ['Peshawar', 'Mardan', 'Abbottabad', 'Swat'],
  Balochistan: ['Quetta', 'Khuzdar', 'Gwadar', 'Sibi'],
  'Islamabad Capital Territory': ['Islamabad', 'Bhara Kahu', 'Tarnol', 'Rawat'],
};

const ShippingSettings: React.FC = () => {
  const [pickupAddress, setPickupAddress] = React.useState('');
  const [returnAddress, setReturnAddress] = React.useState('');
  const [sameAsPickup, setSameAsPickup] = React.useState(false);

  const [pickupProvince, setPickupProvince] = React.useState<string>('');
  const [pickupCity, setPickupCity] = React.useState<string>('');
  const [returnProvince, setReturnProvince] = React.useState<string>('');
  const [returnCity, setReturnCity] = React.useState<string>('');

  React.useEffect(() => {
    if (sameAsPickup) {
      setReturnAddress(pickupAddress);
      setReturnProvince(pickupProvince);
      setReturnCity(pickupCity);
    }
  }, [sameAsPickup, pickupAddress, pickupProvince, pickupCity]);

  return (
    <div className="w-full md:px-6 md:space-y-6">
      {/* Pickup */}
      <div className="text-[#1F1F1F] text-[14px] font-semibold mb-2">Edit a Pick up Adress</div>
      <div className="mb-3">
        <input
          className={inputBoxClass}
          value={pickupAddress}
          onChange={(e) => setPickupAddress(e.target.value)}
          placeholder="Address Details: Number, Street, Landmark, etc."
        />
      </div>
      <div className="mb-2 grid md:grid-cols-2 grid-cols-1 gap-3">
        <select
          className={`${selectBoxClass} ${!pickupProvince ? 'text-[#B8B1B1]' : 'text-[#1F1F1F]'}`}
          value={pickupProvince}
          onChange={(e) => {
            const newProvince = e.target.value;
            setPickupProvince(newProvince);
            setPickupCity('');
          }}
        >
          <option value="" disabled>
            Select Province
          </option>
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          className={`${selectBoxClass} ${!pickupCity ? 'text-[#B8B1B1]' : 'text-[#1F1F1F]'}`}
          value={pickupCity}
          onChange={(e) => setPickupCity(e.target.value)}
          disabled={!pickupProvince}
        >
          <option value="" disabled>
            Select City
          </option>
          {(citiesByProvince[pickupProvince] || []).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Return */}
      <div className="text-[#1F1F1F] text-[14px] font-semibold mb-2">Return Adress</div>
      <div className="mb-2 flex items-center gap-2">
        <label htmlFor="sameAsPickup" className="flex items-center gap-2 cursor-pointer">
          <input
            id="sameAsPickup"
            type="checkbox"
            className="sr-only peer"
            checked={sameAsPickup}
            onChange={(e) => setSameAsPickup(e.target.checked)}
          />
          <span className={`w-[17px] h-[17px] rounded border border-[#2ECC71] inline-flex items-center justify-center transition-colors ${sameAsPickup ? 'bg-[#2ECC71]' : ''}`}>
            {sameAsPickup && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3.5 8.5L6.5 11.5L12.5 5.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className="text-[11px] text-[#B8B1B1]">Same Address as Pickup Address</span>
        </label>
      </div>
      <div className="mb-3">
        <input
          className={inputBoxClass}
          value={returnAddress}
          onChange={(e) => setReturnAddress(e.target.value)}
          placeholder="Address Details: Number, Street, Landmark, etc."
          disabled={sameAsPickup}
        />
      </div>
      <div className="mb-6 grid md:grid-cols-2 grid-cols-1 gap-3">
        <select
          className={`${selectBoxClass} ${!returnProvince ? 'text-[#B8B1B1]' : 'text-[#1F1F1F]'}`}
          value={returnProvince}
          onChange={(e) => {
            const newProvince = e.target.value;
            setReturnProvince(newProvince);
            setReturnCity('');
          }}
          disabled={sameAsPickup}
        >
          <option value="" disabled>
            Select Province
          </option>
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          className={`${selectBoxClass} ${!returnCity ? 'text-[#B8B1B1]' : 'text-[#1F1F1F]'}`}
          value={returnCity}
          onChange={(e) => setReturnCity(e.target.value)}
          disabled={sameAsPickup || !returnProvince}
        >
          <option value="" disabled>
            Select City
          </option>
          {(citiesByProvince[returnProvince] || []).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center md:gap-16 gap-4">
        <button className="bg-[#2ECC71] text-white rounded-lg px-5 h-[49px] text-[14px] font-bold">Update</button>
        <button
          className="text-[#4C535F] text-[14px] font-medium"
          onClick={() => {
            setPickupAddress('');
            setReturnAddress('');
            setSameAsPickup(false);
            setPickupProvince('');
            setPickupCity('');
            setReturnProvince('');
            setReturnCity('');
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default ShippingSettings;


