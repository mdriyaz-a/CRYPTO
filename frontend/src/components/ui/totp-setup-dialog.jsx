import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Shield, RefreshCw } from "lucide-react";

export function TotpSetupDialog({
  open,
  onOpenChange,
  qrCode,
  totpSecret,
  totpCode,
  setTotpCode,
  onVerify,
  isVerifying
}) {
  // Log when dialog props change
  useEffect(() => {
    console.log('TotpSetupDialog props updated:', { 
      open, 
      hasQrCode: !!qrCode, 
      hasSecret: !!totpSecret,
      codeLength: totpCode?.length || 0
    });
  }, [open, qrCode, totpSecret, totpCode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Scan the QR code with your authenticator app or enter the secret key manually.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          {qrCode ? (
            <div className="border-2 border-primary p-2 rounded-md bg-white">
              <img 
                src={qrCode} 
                alt="TOTP QR Code" 
                width={200}
                height={200}
                onLoad={() => console.log('QR code image loaded successfully in dialog')}
                onError={(e) => {
                  console.error('QR code image failed to load in dialog', e);
                  // Log the image source length for debugging
                  console.log('QR code source length:', qrCode?.length || 0);
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-[200px] h-[200px] bg-gray-100 rounded-md">
              <p className="text-gray-500 text-center">Loading QR code...</p>
            </div>
          )}
          
          <div className="w-full space-y-2">
            <Label htmlFor="totp-secret">Secret Key</Label>
            <div className="p-3 bg-muted rounded-md text-center font-mono select-all">
              {totpSecret || 'Loading...'}
            </div>
            <p className="text-xs text-muted-foreground">
              If you can't scan the QR code, enter this code manually in your authenticator app
            </p>
          </div>
          
          <div className="w-full space-y-2">
            <Label htmlFor="totp-code">Verification Code</Label>
            <Input
              id="totp-code"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="text-center font-mono text-lg"
            />
          </div>
          
          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-md w-full">
            <AlertCircle className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-sm">
              Make sure to save your authenticator app setup before continuing. You won't be able to see this QR code again.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={onVerify}
            disabled={!totpCode || totpCode.length !== 6 || isVerifying}
            className="gap-2"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Verify and Enable
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}