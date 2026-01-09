import React from 'react';
import { FileX2 } from 'lucide-react';

const EmptyState = ({ title = "No data found", description = "Everything is empty here.", icon: Icon = FileX2 }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border/50 rounded-lg min-h-[300px] gap-2">
            <div className="p-4 bg-secondary/50 rounded-full mb-2">
                <Icon size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-muted-foreground text-sm max-w-xs">{description}</p>
        </div>
    );
};

export default EmptyState;
