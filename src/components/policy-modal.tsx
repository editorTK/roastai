
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  lastUpdated?: string;
  closeButtonText: string;
  icon?: React.ReactNode;
}

const PolicyModal: React.FC<PolicyModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  content, 
  lastUpdated,
  closeButtonText,
  icon 
}) => {
  if (!isOpen) return null;

  // Split content into paragraphs for better readability and styling
  const contentParagraphs = content.trim().split('\n\n');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center">
            {icon}
            {title}
          </DialogTitle>
        </DialogHeader>
        {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-[-0.5rem] mb-2">{lastUpdated}</p>
        )}
        <Separator className="mb-4"/>
        <ScrollArea className="flex-grow pr-6">
          <div className="space-y-4">
            {contentParagraphs.map((paragraph, index) => {
              const lines = paragraph.split('\n');
              const firstLine = lines[0];
              // Check if the first line looks like a heading (e.g., "Data Collected", "Uso de cookies")
              // This is a simple heuristic; adjust as needed.
              const isHeading = lines.length > 1 && !firstLine.includes('.') && firstLine.length < 50 && firstLine === firstLine.trim() && !firstLine.endsWith(':');

              if (isHeading) {
                return (
                  <div key={index}>
                    <h3 className="text-lg font-semibold mt-3 mb-1">{firstLine}</h3>
                    {lines.slice(1).map((line, lineIndex) => (
                       <p key={`${index}-${lineIndex}`} className="text-sm text-muted-foreground leading-relaxed">{line}</p>
                    ))}
                  </div>
                );
              }
              return <p key={index} className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{paragraph}</p>;
            })}
          </div>
        </ScrollArea>
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>
              {closeButtonText}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyModal;
