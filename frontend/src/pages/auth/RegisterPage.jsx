import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Lock, Mail, User, Shield, Smartphone, AlertCircle } from 'lucide-react'

const RegisterPage = () => {
  const { register, verifyTOTP } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  // Form states
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mfaMethod, setMfaMethod] = useState('none')
  const [isLoading, setIsLoading] = useState(false)

  // TOTP states
  const [showTotpSetup, setShowTotpSetup] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [totpSecret, setTotpSecret] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [userId, setUserId] = useState(null)
  const [verifyingTotp, setVerifyingTotp] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    
    // Validate passwords match
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match',
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      console.log('Registering with MFA method:', mfaMethod)
      const response = await register({
        username,
        email,
        password,
        mfa_method: mfaMethod
      })
      
      // If TOTP is enabled, show QR code
      if (mfaMethod === 'totp' && response.qr_code) {
        setQrCode(response.qr_code)
        setTotpSecret(response.totp_secret)
        setUserId(response.user.id)
        setShowTotpSetup(true)

        toast({
          title: 'Account Created',
          description: 'Please scan the QR code with your authenticator app and verify it',
        })
      } else {
        toast({
          title: 'Registration Successful',
          description: 'Your account has been created successfully',
        })
        navigate('/login')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.response?.data?.error || 'Failed to create account',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyTotp = async () => {
    if (!totpCode || totpCode.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Invalid Code',
        description: 'Please enter a valid 6-digit code',
      })
      return
    }

    setVerifyingTotp(true)

    try {
      // Call API to verify TOTP
      await verifyTOTP(userId, totpCode)

      toast({
        title: 'Setup Complete',
        description: 'Your authenticator app has been set up successfully',
      })

      // Redirect to login page
      navigate('/login')
    } catch (error) {
      console.error('TOTP verification error:', error)
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.response?.data?.error || 'Invalid authenticator code',
      })
    } finally {
      setVerifyingTotp(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {showTotpSetup ? 'Set Up Authenticator' : 'Create an Account'}
            </CardTitle>
            <CardDescription className="text-center">
              {showTotpSetup
                ? 'Scan the QR code with your authenticator app'
                : 'Enter your details to create your account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showTotpSetup ? (
              // Registration Form
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a username"
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
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>Two-Factor Authentication</Label>
                  <RadioGroup value={mfaMethod} onValueChange={setMfaMethod} className="space-y-2">
                    <div className="flex items-center space-x-2 rounded-md border p-3">
                      <RadioGroupItem value="none" id="mfa-none" />
                      <div className="flex-1">
                        <Label htmlFor="mfa-none" className="text-sm cursor-pointer">No 2FA</Label>
                        <p className="text-xs text-muted-foreground">
                          Login with just your username and password
                        </p>
                      </div>
                      <Shield className="h-4 w-4 text-muted-foreground" />
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
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Register'}
                </Button>
              </form>
            ) : (
              // TOTP Setup
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={qrCode}
                    alt="TOTP QR Code"
                    className="border-2 border-primary p-2 rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Manual Entry Code</Label>
                  <div className="p-3 bg-muted rounded-md text-center font-mono">
                    {totpSecret}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    If you can't scan the QR code, enter this code manually in your authenticator app
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totp-code">Verification Code</Label>
                  <Input
                    id="totp-code"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="text-center font-mono text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit code from your authenticator app to verify setup
                  </p>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-md">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <p className="text-sm">
                    Make sure to save your authenticator app setup before continuing. You won't be able to see this QR code again.
                  </p>
                </div>

                <Button
                  onClick={handleVerifyTotp}
                  className="w-full"
                  disabled={!totpCode || totpCode.length !== 6 || verifyingTotp}
                >
                  {verifyingTotp ? 'Verifying...' : 'Verify and Complete Setup'}
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Your data is securely encrypted</span>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

export default RegisterPage