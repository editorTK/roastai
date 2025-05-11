
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShieldAlert, Scale, User, Heart } from 'lucide-react'; // Added User and Heart icons

interface AppFooterProps {
  translations: {
    privacyPolicyButton: string;
    legalNoticeButton: string;
    aboutMeButton: string;
    supportWithPayPalButton: string; // Added for PayPal
    footerText: string;
  };
  onOpenPrivacyModal: () => void;
  onOpenLegalModal: () => void;
  onOpenAboutMeModal: () => void;
  payPalUrl: string; // Added for PayPal URL
  currentYear: string;
}

const AppFooter: React.FC<AppFooterProps> = ({ 
  translations, 
  onOpenPrivacyModal, 
  onOpenLegalModal,
  onOpenAboutMeModal,
  payPalUrl, // Added for PayPal URL
  currentYear,
}) => {
  return (
    <footer className="w-full py-6">
      <Separator className="mb-6" />
      <div className="container mx-auto max-w-3xl flex flex-col items-center space-y-4 text-sm text-muted-foreground">
        {/* Links Section */}
        <div className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-2">
          <Button 
            variant="link" 
            className="p-0 h-auto text-muted-foreground hover:text-accent" 
            onClick={onOpenPrivacyModal}
          >
            <ShieldAlert className="h-4 w-4 mr-1.5" />
            {translations.privacyPolicyButton}
          </Button>
          <Button 
            variant="link" 
            className="p-0 h-auto text-muted-foreground hover:text-accent" 
            onClick={onOpenLegalModal}
          >
            <Scale className="h-4 w-4 mr-1.5" />
            {translations.legalNoticeButton}
          </Button>
          <Button 
            variant="link" 
            className="p-0 h-auto text-muted-foreground hover:text-accent" 
            onClick={onOpenAboutMeModal}
          >
            <User className="h-4 w-4 mr-1.5" />
            {translations.aboutMeButton}
          </Button>
          {payPalUrl && (
            <Button
              variant="link"
              className="p-0 h-auto text-muted-foreground hover:text-accent"
              asChild
            >
              <a href={payPalUrl} target="_blank" rel="noopener noreferrer">
                <Heart className="h-4 w-4 mr-1.5" />
                {translations.supportWithPayPalButton}
              </a>
            </Button>
          )}
        </div>
        
        {/* Copyright Section */}
        {currentYear && <p className="mt-2 text-center">{translations.footerText.replace('{year}', currentYear)}</p>}
      </div>
    </footer>
  );
};

export default AppFooter;

