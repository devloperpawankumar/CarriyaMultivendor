import React from 'react';

type UploadBoxProps = {
  title?: string;
  multiple?: boolean;
  accept?: string;
  onFilesSelected: (files: File[] | File | null) => void;
  className?: string;
};

const UploadBox: React.FC<UploadBoxProps> = ({ title, multiple, accept, onFilesSelected, className }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      onFilesSelected(null);
      return;
    }
    if (multiple) {
      onFilesSelected(Array.from(e.target.files));
    } else {
      onFilesSelected(e.target.files[0] ?? null);
    }
  };

  return (
    <div className={className}>
      {title && (
        <h3 className="text-[15px] md:text-[30px] font-medium text-black mb-2 md:mb-4">{title}</h3>
      )}
      <div className="relative flex justify-start md:justify-end py-2 md:py-3">
        <div className="w-[150px] h-[120px] md:w-[269px] md:h-[221px] border-2 border border-[#B8B1B1] rounded-[30px] md:rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-[#2ECC71] transition-colors">
          <div className="w-[90px] h-[80px] md:w-[153px] mt-2 md:h-[137px] border border-[#2ECC71] rounded-[30px] md:rounded-[25px] flex items-center justify-center mb-2 md:mb-4">
            <div className="w-[70px] h-[72px] md:w-[120px] md:h-[124px] flex items-center justify-center">
              {/* Consumers should overlay an image via CSS if desired */}
            </div>
          </div>
          <p className="text-[10px] md:text-[20px] text-[#B8B1B1] font-normal">Drag or Click to upload</p>
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default UploadBox;


