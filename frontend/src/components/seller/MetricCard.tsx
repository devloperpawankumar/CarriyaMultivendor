import React from 'react';

type IconContainerOptions = {
  width?: number;
  height?: number;
  borderRadius?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  justify?: 'start' | 'center';
  marginTop?: number;
  marginLeft?: number;
};

type MetricCardProps = {
  title: string;
  value: string;
  icon?: React.ReactNode;
  accent?: 'green' | 'gray';
  buttonText?: string;
  showButton?: boolean;
  onButtonClick?: () => void;
  iconContainer?: IconContainerOptions;
  cardStyle?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  contentAlign?: 'left' | 'center';
  className?: string;          // ✅ NEW
  valueStyle?: React.CSSProperties; // ✅ NEW - customize value/subtitle styling
  valueIsPlainText?: boolean;       // ✅ NEW - disable currency split logic
  contentPaddingTop?: number;       // ✅ NEW - control top padding of inner content
  buttonPaddingBottom?: number;     // ✅ NEW - control bottom padding around button
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  accent = 'green',
  buttonText,
  showButton = true,
  onButtonClick,
  iconContainer,
  cardStyle,
  buttonStyle,
  contentAlign = 'left',
  className = '',               // ✅ NEW
  valueStyle,
  valueIsPlainText = false,
  contentPaddingTop = 26,
  buttonPaddingBottom = 12,
}) => {
  const firstSpaceIdx = value.indexOf(' ');
  const shouldTreatAsCurrency = !valueIsPlainText && firstSpaceIdx > 0;
  const currencyLabel = shouldTreatAsCurrency ? value.slice(0, firstSpaceIdx) : '';
  const amountText = shouldTreatAsCurrency ? value.slice(firstSpaceIdx + 1) : value;

  return (
    <div
      className={`rounded-[25px] border brder-[#B8B1B1] bg-white ${className}`}
      style={{
        borderColor: '#B8B1B1',
        width: 235,
        height: 211,
        ...(cardStyle || {}),
      }}
    >
      <div
        className={`h-full flex flex-col ${
          contentAlign === 'center' ? 'items-center' : ''
        }`}
        style={{ paddingTop: contentPaddingTop, paddingLeft: 25, paddingRight: 25 }}
      >
        <div
          className={`flex items-center ${
            iconContainer?.justify === 'center' ? 'justify-center' : 'justify-start'
          }`}
          style={{
            width: iconContainer?.width ?? 67,
            height: iconContainer?.height ?? 60,
            borderRadius: iconContainer?.borderRadius ?? 0,
            backgroundColor: iconContainer?.backgroundColor,
            borderStyle: iconContainer?.borderColor ? 'solid' : undefined,
            borderColor: iconContainer?.borderColor,
            borderWidth: iconContainer?.borderWidth,
            marginTop: iconContainer?.marginTop,
            marginLeft: iconContainer?.marginLeft,
          }}
        >
          {icon}
        </div>

        <div
          className={`text-[#949494] text-[15px] ${
            contentAlign === 'center' ? 'text-center w-full' : ''
          }`}
          style={{ marginTop: 18 }}
        >
          {title}
        </div>

        {shouldTreatAsCurrency ? (
          <div style={{ marginTop: 15 }}>
            <div
              className={`flex items-end gap-2 ${
                contentAlign === 'center' ? 'justify-center' : ''
              }`}
            >
              <span className="text-[#2ECC71] text-[16px] leading-[1.2]">
                {currencyLabel}
              </span>
              <span className="text-[#2ECC71] text-[20px] font-bold leading-[1.2]">
                {amountText}
              </span>
            </div>
          </div>
        ) : (
          <div
            className={`text-[20px] font-bold ${
              contentAlign === 'center' ? 'text-center w-full' : ''
            }`}
            style={{
              marginTop: 18,
              color: accent === 'green' ? '#2ECC71' : '#000000',
              ...(valueStyle || {}),
            }}
          >
            {amountText}
          </div>
        )}

        {showButton && (
          <div className={`mt-auto ${contentAlign === 'center' ? 'flex justify-center' : ''}`} style={{ paddingBottom: buttonPaddingBottom }}>
            <button
              type="button"
              className="h-7 rounded-[10px] text-white text-[15px] font-bold"
              style={{
                backgroundColor: '#2ECC71',
                width: 109,
                marginLeft: contentAlign === 'center' ? 0 : 38,
                ...(buttonStyle || {}),
              }}
              onClick={onButtonClick}
            >
              {buttonText ?? 'Check Status'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
