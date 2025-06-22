import React from 'react';
import { FiKey, FiLock, FiFileText, FiHash } from 'react-icons/fi';
import { IconBaseProps } from 'react-icons';

interface CategoryIconProps {
  category?: string;
  className?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className }) => {
  switch (category) {
    case 'mnemonic_phrase':
      return <FiHash className={className} />;
    case 'private_key':
      return <FiKey className={className} />;
    case 'password':
      return <FiLock className={className} />;
    case 'other':
    default:
      return <FiFileText className={className} />;
  }
};

export default CategoryIcon; 