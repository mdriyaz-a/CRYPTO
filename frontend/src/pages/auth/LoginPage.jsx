import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Mail, User, Shield, AlertCircle } from 'lucide-react'

const LoginPage = () => {
  const { login, verifyTOTP, verifyEmailOTP } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  // Login states
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // MFA states
  const [mfaRequired, setMfaRequired] = useState(false)
  const [mfaMethod, setMfaMethod] = useState('')
  const [userId, setUserId] = useState(null)
  const [totpCode, setTotpCode] = useState('')
  const [emailOtp, setEmailOtp] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      console.log('Attempting login...')
      const response = await login({
        username: usernameOrEmail,
        password
      })
      
      // Check if MFA is required
      if (response.message === 'MFA required') {
        console.log('MFA required:', response.mfa_method)
        setMfaRequired(true)
        setMfaMethod(response.mfa_method)
        setUserId(response.user_id)
        
        toast({
          title: 'Verification Required',
          description: `Please enter your ${response.mfa_method === 'totp' ? 'authenticator code' : 'email verification code'}`,
        })
      } else {
        // Login successful, navigate to home
        console.log('Login successful')
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        })
        navigate('/')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.response?.data?.error || 'Invalid credentials',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyTOTP = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      console.log('Verifying TOTP...')
      await verifyTOTP(userId, totpCode)
      
      toast({
        title: 'Verification Successful',
        description: 'You have been logged in successfully',
      })
      navigate('/')
    } catch (error) {
      console.error('TOTP verification error:', error)
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.response?.data?.error || 'Invalid code',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyEmailOTP = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      console.log('Verifying Email OTP...')
      await verifyEmailOTP(userId, emailOtp)
      
      toast({
        title: 'Verification Successful',
        description: 'You have been logged in successfully',
      })
      navigate('/')
    } catch (error) {
      console.error('Email OTP verification error:', error)
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.response?.data?.error || 'Invalid code',
      })
    } finally {
      setIsLoading(false)
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
              {mfaRequired ? 'Verification Required' : 'Login to Your Account'}
            </CardTitle>
            <CardDescription className="text-center">
              {mfaRequired
                ? `Enter your ${mfaMethod === 'totp' ? 'authenticator code' : 'email verification code'}`
                : 'Enter your credentials to access your account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!mfaRequired ? (
              // Login Form
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="usernameOrEmail">Username or Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="usernameOrEmail"
                      type="text"
                      placeholder="Enter your username or email"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            ) : mfaMethod === 'totp' ? (
              // TOTP Verification Form
              <form onSubmit={handleVerifyTOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totpCode">Authenticator Code</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="totpCode"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      className="pl-10"
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>
              </form>
            ) : (
              // Email OTP Verification Form
              <form onSubmit={handleVerifyEmailOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailOtp">Email Verification Code</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="emailOtp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                      className="pl-10"
                      maxLength={6}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>Check your email for the verification code</span>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Register
              </Link>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Secured with encryption</span>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

export default LoginPage