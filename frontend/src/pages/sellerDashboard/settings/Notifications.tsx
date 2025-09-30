import React from 'react';
import notificationicon from '../../../assets/images/Seller/notification-5-fill.png';
import emailicon from '../../../assets/images/Seller/mail-3-fill.png';
import whatsappicon from '../../../assets/images/Seller/chat-thread-fill.png';



type ToggleProps = {
  active?: boolean;
  onChange?: (next: boolean) => void;
};

const Toggle: React.FC<ToggleProps> = ({ active = false, onChange }) => {
  const [isOn, setIsOn] = React.useState<boolean>(active);
  const handleClick = () => {
    const next = !isOn;
    setIsOn(next);
    onChange && onChange(next);
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative w-[32px] h-[20px] rounded-full"
      style={{ backgroundColor: isOn ? '#2ECC71' : '#E9FFF2' }}
      aria-pressed={isOn}
    >
      <span
        className="absolute top-[4px] w-[12px] h-[12px] rounded-full bg-white shadow"
        style={{ left: isOn ? 16 : 4 }}
      />
    </button>
  );
};

const Row: React.FC<{ label: string; initialOn: boolean; iconSrc: string }> = ({ label, initialOn, iconSrc }) => {
  return (
    <div className="flex items-center justify-between w-full max-w-[646px] px-1">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-5 h-5 rounded bg-[#C7FFDF]">
          <img src={iconSrc} alt="icon" className=" md:w-[11px] md:h-[11px] w-[9px] h-[9px] object-contain" />
        </div>
        <span className="text-[12px] text-[#1A1A1A]">{label}</span>
      </div>
      <Toggle active={initialOn} />
    </div>
  );
};

const Notifications: React.FC = () => {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[646px] p-1">
        <div className="flex flex-col gap-3 border border-[#F2F2F2] rounded bg-white p-1">
          <div className="flex items-center justify-between py-1 px-1">
            <div className="text-[12px] text-[#1A1A1A] ">Notification preferences</div>
          </div>
          <div className="flex flex-col gap-3 p-2">
            <Row label="In-App" initialOn={false} iconSrc={notificationicon} />
            <Row label="Email" initialOn={true} iconSrc={emailicon} />
            <Row label="Whatsapp" initialOn={true} iconSrc={whatsappicon} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;


