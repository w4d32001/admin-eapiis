import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { LucideProps } from 'lucide-react';
import { ComponentType } from 'react';

interface IconProps extends Omit<LucideProps, 'ref'> {
    iconNode: ComponentType<LucideProps>;
    tooltip: string;
}

export default function TooltipIcon({ iconNode: IconComponent, className, tooltip, ...props }: IconProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span>
                    <IconComponent className={cn('h-4 w-4 cursor-pointer', className)} {...props} />
                </span>
            </TooltipTrigger>
            <TooltipContent>
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    );
}
