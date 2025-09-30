import React, { useState } from 'react';
import Footer from '../../components/Footer';
import UploadImg from '../../assets/images/auth/Upload.png';

const inputBase = 'w-full rounded-[10px] border border-[#E2E0E0] h-[80px] md:h-[80px] px-4 md:px-6 text-[20px] placeholder-[#949494] outline-none';

const ReturnRefundForm: React.FC = () => {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  return (
    <div className="w-full">
      <div className="w-full h-10 bg-carriya-green flex items-center justify-center text-white text-sm md:text-base font-medium">
        Carriya - Buy , Sell And Carry
      </div>

      <div className="mx-auto max-w-[1160px] px-4 md:px-0">
        <div className="mt-8 md:mt-10 text-center">
          <h1 className="text-[25px] md:text-[60px] font-bold leading-tight text-carriya-green">Return & Refund form</h1>
        </div>

        {/* Card container centered like Figma card */}
        <div className="mt-8 flex justify-center">
          <div className="grid grid-cols-1 gap-5  md:space-y-0 space-y-5

            w-full md:w-[852px] mb-16 md:mb-24">
          {/* Order ID */}
          <div>
            <label className="block md:text-[35px] text-[20px] font-semibold leading-tight mb-2 md:mb-3">Order ID</label>
            <input
              className={inputBase + ' md:w-[852px]'}
              style={{ boxShadow: '2px 3px 4px rgba(46, 204, 113, 0.25)' }}
              placeholder="Enter Order ID"
            />
          </div>

          {/* Product Name */}
          <div>
            <label className="block md:text-[35px] text-[20px] font-semibold leading-tight mb-2 md:mb-3">Product Name</label>
            <input
              className={inputBase + ' md:w-[852px]'}
              style={{ boxShadow: '2px 3px 4px rgba(46, 204, 113, 0.25)' }}
              placeholder="Enter Product Name"
            />
          </div>

          {/* Reason For Refund */}
          <div>
            <label className="block md:text-[35px] text-[20px] font-semibold leading-tight mb-2 md:mb-3">Reason For Refund</label>
            <textarea
              className={'w-full md:w-[852px] rounded-[10px] border border-[#E2E0E0] h-[180px] md:h-[223px] px-4 md:px-6 py-4 text-[20px] placeholder-[#949494] outline-none resize-none'}
              style={{ boxShadow: '2px 3px 4px rgba(46, 204, 113, 0.25)' }}
              placeholder="Enter Reason For Refund"
            />
          </div>

          {/* Upload Product Photo */}
          <div>
            <label className="block md:text-[35px] text-[22px] font-semibold leading-tight mb-2 md:mb-3">Upload Product Photo</label>
            <div className="relative flex justify-start md:justify-start py-1 md:py-3">
              <div className="w-[180px] h-[170px] md:w-[342px] md:h-[282px] border-2 border border-[#B8B1B1] bg-white rounded-[20px] md:rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-[#2ECC71] transition-colors">
                <div className="w-[130px] h-[110px] md:w-[195px] md:h-[170px] border border-[#2ECC71] rounded-[25px] md:rounded-[25px] flex items-center justify-center mb-2 md:mb-4 overflow-hidden">
                  {uploadedImageUrl ? (
                    <img src={uploadedImageUrl} alt="Uploaded" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-[100px] h-[95px] md:w-[153px] md:h-[154px] flex items-center justify-center">
                      <img src={UploadImg} alt="Upload" className="object-contain" />
                    </div>
                  )}
                </div>
                <p className="text-[12px] md:text-[25px] text-[#B8B1B1] font-normal">Drag or Click to upload</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setUploadedImageUrl(url);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex md:justify-end">
            <button className="rounded-[15px] bg-carriya-green text-white text-[25px] md:text-[32px] font-semibold w-[180px] h-[50px] md:w-[200px] md:h-[70px]">
              Submit
            </button>
          </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ReturnRefundForm;


