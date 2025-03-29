import { IconSparkles } from '@tabler/icons-react';

import { cn } from '@/utils/class';

const AiButton = ({ className, ...props }: React.ComponentProps<'button'>) => {
  return (
    <button
      className={cn(
        'rounded-full pl-4 pr-6 py-2 bg-purple-50 flex items-center gap-2 text-purple-500 text-sm font-medium hover:bg-purple-100/50 transition-colors justify-center',
        className,
      )}
      {...props}
    >
      <IconSparkles className="size-6" />
      Generate your story with AI
    </button>
  );
};

export default AiButton;
