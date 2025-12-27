import { Heart } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
};

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-3xl',
};

const iconSizeClasses = {
  sm: 16,
  md: 20,
  lg: 32,
};

export const Logo = ({ size = 'md', showText = true }: LogoProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} bg-card rounded-full flex items-center justify-center shadow-sm border border-border`}>
        <Heart className="text-primary fill-primary" size={iconSizeClasses[size]} />
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} font-bold text-primary`}>
          Al-Khidmat
        </span>
      )}
    </div>
  );
};
