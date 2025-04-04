import { useState, useEffect, useCallback } from 'react'
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
import {
  User, Mail, Lock, Shield, Info, Check, AlertCircle,
  RefreshCw, LogOut, QrCode, Smartphone, Eye, EyeOff
} from 'lucide-react'

const AccountPage = () => {
  const { user, getAccount, updateAccount, logout } = useAuth()
  const { toast } = useToast()

  // Profile states
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Password states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // MFA states
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [mfaMethod, setMfaMethod] = useState('none')
  const [qrCode, setQrCode] = useState('')
  const [totpSecret, setTotpSecret] = useState('')

  // Load user data once
  const loadUserData = useCallback(async () => {
    if (dataLoaded) return;

    setIsLoading(true);
    try {
      console.log('Loading user account data...');
      const userData = await getAccount();
      console.log('User data loaded:', userData);

      setUsername(userData.username || '');
      setEmail(userData.email || '');
      setMfaEnabled(userData.mfa_enabled || false);
      setMfaMethod(userData.mfa_method || 'none');

      if (userData.qr_code) {
        setQrCode(userData.qr_code);
      }

      setDataLoaded(true);

      toast({
        title: 'Account Loaded',
        description: 'Your account information has been loaded successfully',
      });
    } catch (error) {
      console.error('Failed to load account:', error);

      // Check if token is invalid and redirect to login
      if (error.response?.status === 401) {
        toast({
          variant: 'destructive',
          title: 'Session Expired',
          description: 'Please log in again',
        });
        logout();
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to load account',
          description: error.message || 'Please try again later',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [getAccount, toast, logout, dataLoaded]);

  // Load data on mount, but only once
  useEffect(() => {
    if (!dataLoaded) {
      loadUserData();
    }
  }, [loadUserData, dataLoaded]);

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

  // Update MFA settings
  const handleUpdateMFA = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await updateAccount({
        mfa_enabled: mfaEnabled,
        mfa_method: mfaMethod,
      })

      if (response.user.qr_code) {
        setQrCode(response.user.qr_code)
      }

      toast({
        title: 'MFA Settings Updated',
        description: 'Your multi-factor authentication settings have been updated',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.response?.data?.error || 'Failed to update MFA settings',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle MFA method change
  const handleMfaMethodChange = (value) => {
    setMfaMethod(value)
    setMfaEnabled(value !== 'none')
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account details
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
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10"
                        required
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
                        required
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={isLoading}>
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
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={isLoading}>
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
          
          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
                <CardDescription>
                  Enhance your account security with multi-factor authentication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateMFA} className="space-y-6">
                  <RadioGroup value={mfaMethod} onValueChange={handleMfaMethodChange} className="space-y-3">
                    <div className="flex items-center space-x-2 rounded-md border p-4">
                      <RadioGroupItem value="none" id="mfa-none" />
                      <div className="flex-1">
                        <Label htmlFor="mfa-none" className="text-base cursor-pointer">No 2FA</Label>
                        <p className="text-sm text-muted-foreground">
                          Login with just your username and password
                        </p>
                      </div>
                      <Shield className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    <div className="flex items-center space-x-2 rounded-md border p-4">
                      <RadioGroupItem value="totp" id="mfa-totp" />
                      <div className="flex-1">
                        <Label htmlFor="mfa-totp" className="text-base cursor-pointer">Authenticator App</Label>
                        <p className="text-sm text-muted-foreground">
                          Use Google Authenticator, Authy, or similar apps
                        </p>
                      </div>
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    <div className="flex items-center space-x-2 rounded-md border p-4">
                      <RadioGroupItem value="email" id="mfa-email" />
                      <div className="flex-1">
                        <Label htmlFor="mfa-email" className="text-base cursor-pointer">Email OTP</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive a one-time code via email
                        </p>
                      </div>
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </RadioGroup>
                  
                  {mfaMethod === 'totp' && (
                    <div className="mt-6 p-4 border rounded-md bg-muted/30">
                      <h3 className="text-lg font-medium mb-2">Authenticator App Setup</h3>
                      
                      {qrCode ? (
                        <div className="space-y-4">
                          <div className="flex justify-center">
                            <img 
                              src={qrCode} 
                              alt="TOTP QR Code" 
                              className="border-2 border-primary p-2 rounded-md"
                            />
                          </div>
                          <p className="text-sm text-center">
                            Scan this QR code with your authenticator app
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-6">
                          <p className="text-sm text-muted-foreground">
                            Save changes to generate a new QR code
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 p-4 rounded-md bg-muted/30">
                    <Info className="h-5 w-5 text-primary" />
                    <p className="text-sm">
                      Two-factor authentication adds an extra layer of security to your account by requiring a second form of verification in addition to your password.
                    </p>
                  </div>
                  
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Save Security Settings
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

export default AccountPage