import React from 'react';

const inputClass =
  'w-full max-w-[594px] h-[42px] rounded-[10px] border border-[#C5C5C5] shadow-[2px_3px_4px_rgba(46,204,113,0.05)] px-3 text-[13px] text-[#000000] bg-white outline-none';

const BusinessDocuments: React.FC = () => {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [storeName, setStoreName] = React.useState('');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');

  return (
    <div className="w-full space-y-5 md:space-y-6 md:px-6">
      {/* Edit Name */}
      <div>
        <div className="text-[#4C535F] text-[12px] mb-2">Edit Name</div>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter Name"
        />
      </div>

      {/* Your Email */}
      <div>
        <div className="text-[#4C535F] text-[12px] mb-2">Your Email</div>
        <input
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter Email"
        />
      </div>

      {/* Change Password */}
      <div>
        <div className="text-[#4C535F] text-[12px] mb-2">Change Password</div>
        <div className="space-y-4">
          <input
            type="password"
            className={inputClass + ' placeholder-[#B8B1B1]'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter Current password"
          />
          <input
            type="password"
            className={inputClass + ' placeholder-[#B8B1B1]'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter New password"
          />
        </div>
      </div>

      {/* Edit Store Name */}
      <div>
        <div className="text-[#4C535F] text-[12px] mb-2">Edit Store Name</div>
        <input
          className={inputClass}
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="Current name"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center md:gap-16 gap-4 pt-2">
        <button className="bg-[#2ECC71] text-white rounded-lg px-5 h-[49px] text-[14px] font-bold">Save Changes</button>
        <button className="text-[#4C535F] text-[14px] font-medium">Reset</button>
      </div>
    </div>
  );
};

export default BusinessDocuments;


