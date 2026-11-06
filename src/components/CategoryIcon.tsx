import React from 'react';
import {
  Globe,
  Atom,
  Calculator,
  Cpu,
  Code,
  Trophy,
  Landmark,
  BookOpen,
  HelpCircle,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  switch (name.toLowerCase()) {
    case 'globe':
      return <Globe {...props} />;
    case 'atom':
      return <Atom {...props} />;
    case 'calculator':
      return <Calculator {...props} />;
    case 'cpu':
      return <Cpu {...props} />;
    case 'code':
      return <Code {...props} />;
    case 'trophy':
      return <Trophy {...props} />;
    case 'landmark':
      return <Landmark {...props} />;
    case 'bookopen':
    case 'book':
      return <BookOpen {...props} />;
    default:
      return <HelpCircle {...props} />;
  }
};
