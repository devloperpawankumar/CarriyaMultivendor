import React from 'react';
import MetricCard from './MetricCard';

type ProductStatCardProps = {
  title: string;
  icon: React.ReactNode;
  buttonText: string;
  className?: string;
  subtitle?: string;
  subtitleStyle?: React.CSSProperties;
  onClick?: () => void;
};

const ProductStatCard: React.FC<ProductStatCardProps> = ({ title, icon, buttonText, className, subtitle, subtitleStyle, onClick }) => {
  return (
    <MetricCard
      className={className}
      title=""
      value={subtitle ?? ''}
      icon={icon}
      buttonText={buttonText}
      onButtonClick={onClick}
      valueIsPlainText
      valueStyle={{ color: '#535353', fontSize: 12, fontWeight: 700, marginTop: -5, ...(subtitleStyle || {}) }}
      contentPaddingTop={38}
      buttonPaddingBottom={21}
      iconContainer={{
        width: 101,
        height: 90,
        borderRadius: 10,
        backgroundColor: 'rgba(46,204,113,0.17)',
        justify: 'center',
      }}
      buttonStyle={{ width: 123, height: 32, marginLeft: 0 }}
      cardStyle={{ width: 235, height: 229, boxShadow: '1px 3px 4px 0 rgba(147, 255, 193, 0.17)' }}
      contentAlign="center"
    />
  );
};

export default ProductStatCard;

export {};


