import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { TotpSetupDialog } from '@/components/ui/totp-setup-dialog'
import {
  User, Mail, Lock, Shield, Info, Check, AlertCircle,
  RefreshCw, LogOut, QrCode, Smartphone, Eye, EyeOff
} from 'lucide-react'

const AccountPageNew = () => {
  const { user, updateAccount, logout } = useAuth()
  const { toast } = useToast()
  
  console.log('AccountPageNew rendering')
  
  // Profile states
  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [isLoading, setIsLoading] = useState(false)
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // MFA states
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfa_enabled || false)
  const [mfaMethod, setMfaMethod] = useState(user?.mfa_method || 'none')
  const [totpCode, setTotpCode] = useState('')
  const [totpSecret, setTotpSecret] = useState(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem('totpSecret');
    return saved || '';
  })
  const [qrCode, setQrCode] = useState(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem('totpQrCode');
    return saved || '';
  })
  const [showTotpDialog, setShowTotpDialog] = useState(false)
  
  // Debug - log when dialog state changes
  useEffect(() => {
    console.log('Dialog state changed:', { showTotpDialog, hasQrCode: !!qrCode, hasSecret: !!totpSecret });
  }, [showTotpDialog, qrCode, totpSecret]);
  
  // Save TOTP data to localStorage when it changes
  useEffect(() => {
    if (totpSecret) {
      localStorage.setItem('totpSecret', totpSecret);
    }
    if (qrCode) {
      localStorage.setItem('totpQrCode', qrCode);
    }
  }, [totpSecret, qrCode]);
  
  // Check for stored TOTP data on mount and show dialog if needed
  useEffect(() => {
    const secret = localStorage.getItem('totpSecret');
    const qr = localStorage.getItem('totpQrCode');
    
    if (secret && qr && !user?.mfa_enabled) {
      console.log('Found stored TOTP data, restoring state');
      setTotpSecret(secret);
      setQrCode(qr);
      
      // Show a toast to let the user know they can continue setup
      toast({
        title: 'Continue 2FA Setup',
        description: 'You have an unfinished authenticator app setup. Click "Show QR Code" to continue.',
      });
    }
  }, []);
  
  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await updateAccount({ username, email })
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.response?.data?.error || 'Failed to update profile',
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Update password
  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please make sure your new passwords match',
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      await updateAccount({ password: newPassword })
      toast({
        title: 'Password Updated',
        description: 'Your password has been updated successfully',
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.response?.data?.error || 'Failed to update password',
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Setup TOTP - separate function
  const setupTotp = async () => {
    setIsLoading(true);
    
    try {
      console.log('Setting up TOTP...');
      
      // Call API to get TOTP secret
      const response = await updateAccount({
        mfa_enabled: true,
        mfa_method: 'totp',
        setup_only: true
      });
      
      console.log('TOTP setup response:', response);
      
      if (response.user && response.user.totp_secret) {
        const secret = response.user.totp_secret;
        console.log('TOTP secret received:', secret);
        
        // Set the TOTP secret
        setTotpSecret(secret);
        
        // Set the QR code if available
        if (response.user.qr_code) {
          console.log('QR code received, length:', response.user.qr_code.length);
          setQrCode(response.user.qr_code);
          
          // Store in localStorage
          localStorage.setItem('totpSecret', secret);
          localStorage.setItem('totpQrCode', response.user.qr_code);
        } else {
          console.error('No QR code in response');
        }
        
        // Show TOTP setup dialog after a short delay
        console.log('Opening TOTP dialog...');
        setTimeout(() => {
          setShowTotpDialog(true);
        }, 500);
        
        toast({
          title: 'Scan QR Code',
          description: 'Please scan the QR code with your authenticator app and enter the code to verify',
        });
      } else {
        console.error('No TOTP secret in response:', response);
        toast({
          variant: 'destructive',
          title: 'Setup Failed',
          description: 'Failed to generate authenticator setup. Please try again.',
        });
      }
    } catch (error) {
      console.error('TOTP setup error:', error);
      toast({
        variant: 'destructive',
        title: 'Setup Failed',
        description: error.response?.data?.error || 'Failed to set up authenticator',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update MFA settings
  const handleUpdateMFA = async (e) => {
    e.preventDefault();
    
    // For TOTP setup
    if (mfaMethod === 'totp' && user?.mfa_method !== 'totp') {
      // Use the separate function for TOTP setup
      await setupTotp();
      return;
    }
    
    // For other methods or disabling MFA
    setIsLoading(true);
    
    try {
      await updateAccount({
        mfa_enabled: mfaEnabled,
        mfa_method: mfaMethod,
      });
      
      toast({
        title: 'MFA Settings Updated',
        description: 'Your multi-factor authentication settings have been updated',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.response?.data?.error || 'Failed to update MFA settings',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle TOTP verification
  const handleVerifyTotp = async () => {
    if (totpCode.length !== 6) return;
    
    setIsLoading(true);
    
    try {
      // Call API to verify TOTP
      const verifyResponse = await updateAccount({
        mfa_enabled: true,
        mfa_method: 'totp',
        totp_code: totpCode
      });
      
      console.log('TOTP verification response:', verifyResponse);
      
      // Close dialog and reset code
      setShowTotpDialog(false);
      setTotpCode('');
      
      // Update local state
      setMfaEnabled(true);
      setMfaMethod('totp');
      
      // Clear localStorage
      localStorage.removeItem('totpSecret');
      localStorage.removeItem('totpQrCode');
      
      toast({
        title: 'TOTP Verified',
        description: 'Two-factor authentication has been enabled successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.response?.data?.error || 'Invalid authenticator code',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle MFA method change
  const handleMfaMethodChange = (value) => {
    // If changing from TOTP dialog mode, reset it
    if (showTotpDialog && value !== 'totp') {
      setShowTotpDialog(false);
      setTotpCode('');
    }
    
    setMfaMethod(value);
    setMfaEnabled(value !== 'none');
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };
  
  // Function to manually show the dialog
  const showQrCodeDialog = () => {
    console.log('Manually showing QR code dialog');
    setShowTotpDialog(true);
  };
  
  return (
    <div className="container max-w-4xl py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and security preferences</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </TabsTrigger>
            <TabsTrigger value="mfa" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              2FA
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Password Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="current-password"
                        type={showPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* MFA Tab */}
          <TabsContent value="mfa">
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Enhance your account security with two-factor authentication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateMFA} className="space-y-6">
                  <div className="space-y-4">
                    <Label>Authentication Method</Label>
                    <RadioGroup 
                      value={mfaMethod} 
                      onValueChange={(value) => handleMfaMethodChange(value)}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2 rounded-md border p-3">
                        <RadioGroupItem value="none" id="mfa-none" />
                        <div className="flex-1">
                          <Label htmlFor="mfa-none" className="text-sm cursor-pointer">No 2FA</Label>
                          <p className="text-xs text-muted-foreground">
                            Not recommended. Your account will be less secure.
                          </p>
                        </div>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      <div className="flex items-center space-x-2 rounded-md border p-3">
                        <RadioGroupItem value="totp" id="mfa-totp" />
                        <div className="flex-1">
                          <Label htmlFor="mfa-totp" className="text-sm cursor-pointer">Authenticator App</Label>
                          <p className="text-xs text-muted-foreground">
                            Use Google Authenticator, Authy, or similar apps
                          </p>
                        </div>
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      <div className="flex items-center space-x-2 rounded-md border p-3">
                        <RadioGroupItem value="email" id="mfa-email" />
                        <div className="flex-1">
                          <Label htmlFor="mfa-email" className="text-sm cursor-pointer">Email OTP</Label>
                          <p className="text-xs text-muted-foreground">
                            Receive a one-time code via email
                          </p>
                        </div>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {/* TOTP Setup Section */}
                  {mfaMethod === 'totp' && (
                    <div className="space-y-4 mt-4">
                      {/* Info section */}
                      <div className="p-4 bg-muted rounded-md">
                        <div className="flex items-start space-x-3">
                          <Info className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h4 className="font-medium">Authenticator App Setup</h4>
                            <p className="text-sm text-muted-foreground">
                              Click the button below to set up your authenticator app. You'll need to scan a QR code and enter a verification code.
                            </p>
                            
                            {/* Show QR Code button - only if we have a QR code */}
                            {qrCode && (
                              <Button 
                                type="button" 
                                variant="secondary" 
                                className="mt-2 w-full"
                                onClick={(e) => {
                                  e.preventDefault();
                                  showQrCodeDialog();
                                }}
                              >
                                <QrCode className="mr-2 h-4 w-4" />
                                Show QR Code
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Current MFA Status */}
                  {user?.mfa_enabled && (
                    <div className="p-4 bg-muted rounded-md">
                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Two-Factor Authentication is Enabled</h4>
                          <p className="text-sm text-muted-foreground">
                            Current method: {user.mfa_method === 'totp' ? 'Authenticator App' : 
                                            user.mfa_method === 'email' ? 'Email OTP' : 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        {mfaMethod === 'totp' && user?.mfa_method !== 'totp' 
                          ? 'Generating QR Code...' 
                          : 'Updating Settings...'}
                      </>
                    ) : (
                      <>
                        {mfaMethod === 'totp' && user?.mfa_method !== 'totp' ? (
                          <>
                            <QrCode className="mr-2 h-4 w-4" />
                            Set Up Authenticator App
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Save MFA Settings
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* TOTP Setup Dialog */}
            <TotpSetupDialog
              open={showTotpDialog}
              onOpenChange={setShowTotpDialog}
              qrCode={qrCode}
              totpSecret={totpSecret}
              totpCode={totpCode}
              setTotpCode={setTotpCode}
              onVerify={handleVerifyTotp}
              isVerifying={isLoading}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

export default AccountPageNew