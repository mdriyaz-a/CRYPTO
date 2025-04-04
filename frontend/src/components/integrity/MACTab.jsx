import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Info, ArrowRight, RefreshCw, Copy, Eye, EyeOff, Check, X } from 'lucide-react'
import { integrityService } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatHex, generateRandomKey } from '@/lib/utils'
import HMACVisualization from './HMACVisualization'

const MACTab = () => {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('compute')
  const [message, setMessage] = useState('Hello, World!')
  const [key, setKey] = useState('mysecretkey')
  const [algorithm, setAlgorithm] = useState('sha256')
  const [macResult, setMacResult] = useState(null)
  const [steps, setSteps] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showAllSteps, setShowAllSteps] = useState(false)
  const [showKey, setShowKey] = useState(false)
  
  // For validation tab
  const [validateMessage, setValidateMessage] = useState('Hello, World!')
  const [validateKey, setValidateKey] = useState('mysecretkey')
  const [validateMac, setValidateMac] = useState('')
  const [validationResult, setValidationResult] = useState(null)
  const [isValidating, setIsValidating] = useState(false)

  // Compute MAC
  const computeMAC = async () => {
    if (!message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a message'
      })
      return
    }

    if (!key) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a key'
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await integrityService.computeMAC(message, key, algorithm)
      setMacResult(result)
      setSteps(result.steps)
      setCurrentStep(0)
      
      // Update validation tab with the computed MAC
      setValidateMessage(message)
      setValidateKey(key)
      setValidateMac(result.hmac)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error || 'An error occurred during MAC computation'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Validate MAC
  const validateMAC = async () => {
    if (!validateMessage) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a message'
      })
      return
    }

    if (!validateKey) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a key'
      })
      return
    }

    if (!validateMac) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a MAC to validate'
      })
      return
    }

    setIsValidating(true)
    try {
      const result = await integrityService.validateMAC(validateMessage, validateKey, validateMac, algorithm)
      setValidationResult(result)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error || 'An error occurred during MAC validation'
      })
    } finally {
      setIsValidating(false)
    }
  }

  // Generate a random key
  const generateKey = () => {
    const newKey = generateRandomKey(16)
    setKey(newKey)
    toast({
      title: 'New Key Generated',
      description: 'A new random key has been created.'
    })
  }

  // Copy MAC to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: 'MAC copied to clipboard'
    })
  }

  // Process initial MAC computation on component mount or algorithm change
  useEffect(() => {
    computeMAC()
  }, [algorithm])

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compute">Compute HMAC</TabsTrigger>
          <TabsTrigger value="validate">Validate HMAC</TabsTrigger>
        </TabsList>
        
        <TabsContent value="compute" className="space-y-8 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Input Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter message"
                      className="font-mono mt-1.5"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center">
                      <Label htmlFor="key">Secret Key</Label>
                      <Button variant="outline" size="sm" onClick={generateKey}>
                        Generate Key
                      </Button>
                    </div>
                    <div className="relative mt-1.5">
                      <Input
                        id="key"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        type={showKey ? 'text' : 'password'}
                        placeholder="Enter secret key"
                        className="font-mono pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowKey(!showKey)}
                      >
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="algorithm">Hash Algorithm</Label>
                    <Select value={algorithm} onValueChange={setAlgorithm}>
                      <SelectTrigger id="algorithm" className="mt-1.5">
                        <SelectValue placeholder="Select algorithm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="md5">HMAC-MD5</SelectItem>
                        <SelectItem value="sha1">HMAC-SHA1</SelectItem>
                        <SelectItem value="sha256">HMAC-SHA256</SelectItem>
                        <SelectItem value="sha512">HMAC-SHA512</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={computeMAC} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="mr-2 h-4 w-4" />
                    )}
                    Compute HMAC
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Result Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center">
                      <Label>HMAC Result ({algorithm.toUpperCase()})</Label>
                      {macResult && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(macResult.hmac)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="p-3 bg-muted rounded-md mt-1.5 overflow-x-auto">
                      <p className="font-mono text-sm break-all">
                        {macResult ? macResult.hmac : 'Computing...'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Message in Hexadecimal</Label>
                    <div className="p-3 bg-muted rounded-md mt-1.5 overflow-x-auto">
                      <p className="font-mono text-sm break-all">
                        {macResult ? formatHex(macResult.message_hex) : 'Computing...'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Key in Hexadecimal</Label>
                    <div className="p-3 bg-muted rounded-md mt-1.5 overflow-x-auto">
                      <p className="font-mono text-sm break-all">
                        {macResult ? formatHex(macResult.key_hex) : 'Computing...'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Visualization Section */}
          {steps.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">HMAC Computation Process</h2>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllSteps(!showAllSteps)}
                  >
                    {showAllSteps ? 'Show Step by Step' : 'Show All Steps'}
                  </Button>
                </div>
              </div>

              {showAllSteps ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {steps.map((step, index) => (
                    <HMACVisualization key={index} step={step} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                    >
                      Previous Step
                    </Button>
                    <span className="text-muted-foreground">
                      Step {currentStep + 1} of {steps.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                      disabled={currentStep === steps.length - 1}
                    >
                      Next Step
                    </Button>
                  </div>
                  
                  <HMACVisualization step={steps[currentStep]} />
                </div>
              )}
            </motion.div>
          )}
        </TabsContent>
        
        <TabsContent value="validate" className="space-y-8 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Validation Input Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="validate-message">Message</Label>
                    <Textarea
                      id="validate-message"
                      value={validateMessage}
                      onChange={(e) => setValidateMessage(e.target.value)}
                      placeholder="Enter message to validate"
                      className="font-mono mt-1.5"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="validate-key">Secret Key</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="validate-key"
                        value={validateKey}
                        onChange={(e) => setValidateKey(e.target.value)}
                        type={showKey ? 'text' : 'password'}
                        placeholder="Enter secret key"
                        className="font-mono pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowKey(!showKey)}
                      >
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="validate-mac">HMAC to Validate</Label>
                    <Input
                      id="validate-mac"
                      value={validateMac}
                      onChange={(e) => setValidateMac(e.target.value)}
                      placeholder="Enter HMAC to validate"
                      className="font-mono mt-1.5"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="validate-algorithm">Hash Algorithm</Label>
                    <Select value={algorithm} onValueChange={setAlgorithm}>
                      <SelectTrigger id="validate-algorithm" className="mt-1.5">
                        <SelectValue placeholder="Select algorithm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="md5">HMAC-MD5</SelectItem>
                        <SelectItem value="sha1">HMAC-SHA1</SelectItem>
                        <SelectItem value="sha256">HMAC-SHA256</SelectItem>
                        <SelectItem value="sha512">HMAC-SHA512</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={validateMAC} disabled={isValidating} className="w-full">
                    {isValidating ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="mr-2 h-4 w-4" />
                    )}
                    Validate HMAC
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Validation Result Section */}
            <Card>
              <CardContent className="pt-6">
                {validationResult ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center p-6">
                      {validationResult.valid ? (
                        <div className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                          </div>
                          <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">
                            HMAC Verified
                          </h3>
                          <p className="text-muted-foreground mt-2">
                            The provided HMAC is valid for this message and key.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                            <X className="h-8 w-8 text-red-600 dark:text-red-400" />
                          </div>
                          <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">
                            HMAC Invalid
                          </h3>
                          <p className="text-muted-foreground mt-2">
                            {validationResult.explanation || "The provided HMAC does not match the computed HMAC."}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label>Provided HMAC</Label>
                      <div className="p-3 bg-muted rounded-md mt-1.5 overflow-x-auto">
                        <p className="font-mono text-sm break-all">
                          {validationResult.provided_hmac}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Computed HMAC</Label>
                      <div className="p-3 bg-muted rounded-md mt-1.5 overflow-x-auto">
                        <p className="font-mono text-sm break-all">
                          {validationResult.computed_hmac}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Info className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">HMAC Validation</h3>
                    <p className="text-muted-foreground mt-2">
                      Enter a message, key, and HMAC to validate, then click "Validate HMAC".
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Educational Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-semibold">How HMAC Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-3">HMAC Process</h3>
              <ol className="space-y-3 list-decimal list-inside">
                <li className="pl-2">
                  <span className="font-medium">Key Preparation:</span> If the key is longer than the hash function's block size, it is hashed. If it's shorter, it's padded with zeros.
                </li>
                <li className="pl-2">
                  <span className="font-medium">Inner Padding:</span> The key is XORed with the inner pad constant (0x36 repeated).
                </li>
                <li className="pl-2">
                  <span className="font-medium">Outer Padding:</span> The key is XORed with the outer pad constant (0x5C repeated).
                </li>
                <li className="pl-2">
                  <span className="font-medium">Inner Hash:</span> Hash the combination of inner padded key and the message.
                </li>
                <li className="pl-2">
                  <span className="font-medium">Outer Hash:</span> Hash the combination of outer padded key and the inner hash result.
                </li>
              </ol>
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="font-mono text-sm">
                  HMAC(K, m) = H((K ⊕ opad) || H((K ⊕ ipad) || m))
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Where H is the hash function, K is the key, m is the message, || is concatenation, ⊕ is XOR, opad is the outer padding (0x5C), and ipad is the inner padding (0x36).
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-3">Why Use HMAC?</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 bg-primary/20 text-primary rounded-full p-1">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-medium">Authentication:</span> Verifies that the message came from the expected sender who possesses the secret key.
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 bg-primary/20 text-primary rounded-full p-1">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-medium">Integrity:</span> Ensures the message hasn't been altered during transmission.
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 bg-primary/20 text-primary rounded-full p-1">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-medium">Security:</span> More secure than simple hash functions for authentication because it uses a secret key.
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 bg-primary/20 text-primary rounded-full p-1">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-medium">Protection against attacks:</span> Resistant to length extension attacks that can affect plain hash functions.
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-3">Common Applications of HMAC</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-md">
                <h4 className="font-medium mb-2">API Authentication</h4>
                <p className="text-sm text-muted-foreground">
                  Many APIs use HMAC to authenticate requests. The client computes an HMAC of the request parameters using a shared secret key, and the server verifies it.
                </p>
              </div>
              <div className="p-4 border rounded-md">
                <h4 className="font-medium mb-2">Message Authentication</h4>
                <p className="text-sm text-muted-foreground">
                  Ensures that messages haven't been tampered with during transmission and confirms the sender's identity.
                </p>
              </div>
              <div className="p-4 border rounded-md">
                <h4 className="font-medium mb-2">Digital Signatures</h4>
                <p className="text-sm text-muted-foreground">
                  Used as part of digital signature schemes to provide authentication and non-repudiation.
                </p>
              </div>
              <div className="p-4 border rounded-md">
                <h4 className="font-medium mb-2">Password Storage</h4>
                <p className="text-sm text-muted-foreground">
                  HMAC can be used as part of secure password storage systems, often in combination with key derivation functions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default MACTab