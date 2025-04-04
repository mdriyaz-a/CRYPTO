import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Info, ArrowRight, RefreshCw, Check, X, Copy, Eye, EyeOff } from 'lucide-react'
import { encryptionService } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { generateRandomKey, formatHex } from '@/lib/utils'

const AESPage = () => {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('encrypt')
  const [plaintext, setPlaintext] = useState('This is a secret message')
  const [ciphertext, setCiphertext] = useState('')
  const [key, setKey] = useState('mysecretkey12345')
  const [mode, setMode] = useState('cbc')
  const [iv, setIv] = useState('')
  const [steps, setSteps] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showKey, setShowKey] = useState(false)
  const [quizAnswer, setQuizAnswer] = useState('')
  const [quizFeedback, setQuizFeedback] = useState(null)

  // Process encryption/decryption
  const processText = async () => {
    setIsLoading(true)
    try {
      if (activeTab === 'encrypt') {
        const result = await encryptionService.encrypt(plaintext, 'aes', key, { mode })
        setCiphertext(result.ciphertext)
        setIv(result.iv || '')
        setSteps(result.steps)
      } else {
        const result = await encryptionService.decrypt(ciphertext, 'aes', key, { mode, iv })
        setPlaintext(result.plaintext)
        setSteps(result.steps)
      }
      setCurrentStep(0)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error || 'An error occurred during processing'
      })
    } finally {
      setIsLoading(false)
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

  // Copy text to clipboard
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`
    })
  }

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value)
    setSteps([])
    setCurrentStep(0)
  }

  // Check quiz answer
  const checkQuizAnswer = () => {
    const correctAnswer = 'cbc'
    if (quizAnswer.toLowerCase() === correctAnswer) {
      setQuizFeedback({
        correct: true,
        message: 'Correct! CBC mode uses an initialization vector (IV) and chains blocks together for better security.'
      })
    } else {
      setQuizFeedback({
        correct: false,
        message: `Incorrect. The mode that uses an IV and chains blocks together is ${correctAnswer.toUpperCase()}.`
      })
    }
  }

  // Reset quiz
  const resetQuiz = () => {
    setQuizAnswer('')
    setQuizFeedback(null)
  }

  // Process initial encryption on component mount
  useEffect(() => {
    processText()
  }, [])

  return (
    <div className="cipher-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Advanced Encryption Standard (AES)</h1>
        <p className="text-muted-foreground mb-6">
          A symmetric block cipher adopted as an encryption standard by the U.S. government.
        </p>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="encrypt">Encrypt</TabsTrigger>
            <TabsTrigger value="decrypt">Decrypt</TabsTrigger>
          </TabsList>
          
          <TabsContent value="encrypt" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="plaintext">Plaintext</Label>
                <Input
                  id="plaintext"
                  value={plaintext}
                  onChange={(e) => setPlaintext(e.target.value)}
                  placeholder="Enter text to encrypt"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="key">Encryption Key</Label>
                  <Button variant="outline" size="sm" onClick={generateKey}>
                    Generate Key
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="key"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    type={showKey ? 'text' : 'password'}
                    placeholder="Enter encryption key"
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
                <p className="text-xs text-muted-foreground">
                  For AES-256, the key will be derived to 32 bytes.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mode">Mode of Operation</Label>
                <select
                  id="mode"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="ecb">ECB (Electronic Codebook)</option>
                  <option value="cbc">CBC (Cipher Block Chaining)</option>
                  <option value="ctr">CTR (Counter)</option>
                </select>
              </div>
              
              <Button onClick={processText} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Encrypt
              </Button>
              
              {ciphertext && (
                <div className="p-4 border rounded-md bg-muted/30">
                  <div className="flex justify-between items-center mb-2">
                    <Label>Ciphertext (Base64):</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(ciphertext, 'Ciphertext')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm font-mono break-all">{ciphertext}</p>
                  
                  {iv && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <Label>Initialization Vector (IV):</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(iv, 'IV')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm font-mono break-all">{iv}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Save this IV for decryption (required for CBC and CTR modes).
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="decrypt" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="ciphertext">Ciphertext (Base64)</Label>
                <Input
                  id="ciphertext"
                  value={ciphertext}
                  onChange={(e) => setCiphertext(e.target.value)}
                  placeholder="Enter Base64-encoded ciphertext"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="key-decrypt">Decryption Key</Label>
                <div className="relative">
                  <Input
                    id="key-decrypt"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    type={showKey ? 'text' : 'password'}
                    placeholder="Enter decryption key"
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
              
              <div className="space-y-2">
                <Label htmlFor="mode-decrypt">Mode of Operation</Label>
                <select
                  id="mode-decrypt"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="ecb">ECB (Electronic Codebook)</option>
                  <option value="cbc">CBC (Cipher Block Chaining)</option>
                  <option value="ctr">CTR (Counter)</option>
                </select>
              </div>
              
              {(mode === 'cbc' || mode === 'ctr') && (
                <div className="space-y-2">
                  <Label htmlFor="iv">Initialization Vector (IV)</Label>
                  <Input
                    id="iv"
                    value={iv}
                    onChange={(e) => setIv(e.target.value)}
                    placeholder="Enter Base64-encoded IV"
                  />
                  <p className="text-xs text-muted-foreground">
                    Required for CBC and CTR modes.
                  </p>
                </div>
              )}
              
              <Button onClick={processText} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Decrypt
              </Button>
              
              {plaintext && (
                <div className="p-4 border rounded-md bg-muted/30">
                  <div className="flex justify-between items-center mb-2">
                    <Label>Plaintext:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(plaintext, 'Plaintext')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="font-mono">{plaintext}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Visualization Section */}
        {steps.length > 0 && (
          <motion.div
            className="step-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Encryption Process Steps</h2>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={currentStep === steps.length - 1}
                >
                  Next
                </Button>
              </div>
            </div>

            <div className="animation-container">
              {steps[currentStep] && (
                <div className="p-4 border rounded-md bg-card">
                  <h3 className="text-lg font-semibold mb-3">
                    Step: {steps[currentStep].step}
                  </h3>
                  
                  {steps[currentStep].step === 'Input Preparation' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="block mb-1">Plaintext:</Label>
                          <p className="font-mono text-sm break-all">{steps[currentStep].plaintext}</p>
                        </div>
                        <div>
                          <Label className="block mb-1">Plaintext (Hex):</Label>
                          <p className="font-mono text-sm break-all">{steps[currentStep].plaintext_hex}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="block mb-1">Key:</Label>
                          <p className="font-mono text-sm break-all">{steps[currentStep].key}</p>
                        </div>
                        <div>
                          <Label className="block mb-1">Key (Hex):</Label>
                          <p className="font-mono text-sm break-all">{steps[currentStep].key_hex}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="block mb-1">Key Length:</Label>
                        <p className="font-mono">{steps[currentStep].key_length_bits} bits</p>
                      </div>
                    </div>
                  )}
                  
                  {steps[currentStep].step === 'Padding' && (
                    <div className="space-y-3">
                      <div>
                        <Label className="block mb-1">Padding Algorithm:</Label>
                        <p className="font-mono">{steps[currentStep].algorithm}</p>
                      </div>
                      
                      <div>
                        <Label className="block mb-1">Block Size:</Label>
                        <p className="font-mono">{steps[currentStep].block_size_bytes} bytes</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="block mb-1">Original Length:</Label>
                          <p className="font-mono">{steps[currentStep].original_length} bytes</p>
                        </div>
                        <div>
                          <Label className="block mb-1">Padded Length:</Label>
                          <p className="font-mono">{steps[currentStep].padded_length} bytes</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="block mb-1">Padded Data (Hex):</Label>
                        <p className="font-mono text-sm break-all">{steps[currentStep].padded_data_hex}</p>
                      </div>
                    </div>
                  )}
                  
                  {steps[currentStep].step === 'IV Generation' && (
                    <div className="space-y-3">
                      <div>
                        <Label className="block mb-1">IV (Hex):</Label>
                        <p className="font-mono text-sm break-all">{steps[currentStep].iv_hex}</p>
                      </div>
                      
                      <div>
                        <Label className="block mb-1">IV Length:</Label>
                        <p className="font-mono">{steps[currentStep].iv_length_bytes} bytes</p>
                      </div>
                    </div>
                  )}
                  
                  {steps[currentStep].step === 'Mode Selection' && (
                    <div className="space-y-3">
                      <div>
                        <Label className="block mb-1">Mode:</Label>
                        <p className="font-mono">{steps[currentStep].mode}</p>
                      </div>
                      
                      {steps[currentStep].description && (
                        <div>
                          <Label className="block mb-1">Description:</Label>
                          <p>{steps[currentStep].description}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {steps[currentStep].step === 'Encryption' && (
                    <div className="space-y-3">
                      <div>
                        <Label className="block mb-1">Input (Hex):</Label>
                        <p className="font-mono text-sm break-all">{steps[currentStep].input_hex}</p>
                      </div>
                      
                      <div>
                        <Label className="block mb-1">Output (Hex):</Label>
                        <p className="font-mono text-sm break-all">{steps[currentStep].output_hex}</p>
                      </div>
                      
                      <div>
                        <Label className="block mb-1">Output Length:</Label>
                        <p className="font-mono">{steps[currentStep].output_length_bytes} bytes</p>
                      </div>
                    </div>
                  )}
                  
                  {steps[currentStep].step === 'Output Encoding' && (
                    <div className="space-y-3">
                      <div>
                        <Label className="block mb-1">Encoding:</Label>
                        <p className="font-mono">{steps[currentStep].encoding}</p>
                      </div>
                      
                      <div>
                        <Label className="block mb-1">Ciphertext (Base64):</Label>
                        <p className="font-mono text-sm break-all">{steps[currentStep].ciphertext_base64}</p>
                      </div>
                      
                      {steps[currentStep].iv_base64 && (
                        <div>
                          <Label className="block mb-1">IV (Base64):</Label>
                          <p className="font-mono text-sm break-all">{steps[currentStep].iv_base64}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {steps[currentStep].step === 'Decryption' && (
                    <div className="space-y-3">
                      <div>
                        <Label className="block mb-1">Input (Hex):</Label>
                        <p className="font-mono text-sm break-all">{steps[currentStep].input_hex}</p>
                      </div>
                      
                      <div>
                        <Label className="block mb-1">Output (Hex):</Label>
                        <p className="font-mono text-sm break-all">{steps[currentStep].output_hex}</p>
                      </div>
                      
                      <div>
                        <Label className="block mb-1">Output Length:</Label>
                        <p className="font-mono">{steps[currentStep].output_length_bytes} bytes</p>
                      </div>
                    </div>
                  )}
                  
                  {steps[currentStep].step === 'Unpadding' && (
                    <div className="space-y-3">
                      <div>
                        <Label className="block mb-1">Padding Algorithm:</Label>
                        <p className="font-mono">{steps[currentStep].algorithm}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="block mb-1">Padded Length:</Label>
                          <p className="font-mono">{steps[currentStep].padded_length} bytes</p>
                        </div>
                        <div>
                          <Label className="block mb-1">Unpadded Length:</Label>
                          <p className="font-mono">{steps[currentStep].unpadded_length} bytes</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="block mb-1">Unpadded Data (Hex):</Label>
                        <p className="font-mono text-sm break-all">{steps[currentStep].unpadded_data_hex}</p>
                      </div>
                    </div>
                  )}
                  
                  {steps[currentStep].step === 'Output Decoding' && (
                    <div className="space-y-3">
                      <div>
                        <Label className="block mb-1">Plaintext:</Label>
                        <p className="font-mono">{steps[currentStep].plaintext}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Mode Comparison Section */}
        <motion.div
          className="step-container mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold mb-4">AES Modes Comparison</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border rounded-md bg-card">
              <h3 className="font-medium mb-2">ECB Mode</h3>
              <div className="aspect-w-4 aspect-h-3 bg-muted/30 rounded-md mb-3 flex items-center justify-center">
                <div className="grid grid-cols-4 gap-1 p-2">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="w-full aspect-square bg-primary/20 border border-primary/40 rounded-sm"></div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Electronic Codebook mode encrypts each block independently. 
                Identical plaintext blocks result in identical ciphertext blocks, 
                which can reveal patterns in the data.
              </p>
              <div className="mt-3 text-sm">
                <p className="font-medium">Pros:</p>
                <ul className="list-disc list-inside ml-2 mt-1">
                  <li>Simple implementation</li>
                  <li>Parallelizable</li>
                </ul>
              </div>
              <div className="mt-2 text-sm">
                <p className="font-medium">Cons:</p>
                <ul className="list-disc list-inside ml-2 mt-1">
                  <li>Not semantically secure</li>
                  <li>Reveals patterns in data</li>
                  <li>Vulnerable to replay attacks</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 border rounded-md bg-card">
              <h3 className="font-medium mb-2">CBC Mode</h3>
              <div className="aspect-w-4 aspect-h-3 bg-muted/30 rounded-md mb-3 flex items-center justify-center">
                <div className="grid grid-cols-4 gap-1 p-2">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="w-full aspect-square bg-primary/20 border border-primary/40 rounded-sm" style={{ 
                      backgroundColor: `hsla(${(i * 20) % 360}, 70%, 60%, 0.2)`,
                      borderColor: `hsla(${(i * 20) % 360}, 70%, 60%, 0.4)`
                    }}></div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Cipher Block Chaining mode XORs each plaintext block with the previous 
                ciphertext block before encryption, creating a dependency chain that 
                hides patterns.
              </p>
              <div className="mt-3 text-sm">
                <p className="font-medium">Pros:</p>
                <ul className="list-disc list-inside ml-2 mt-1">
                  <li>Hides patterns in data</li>
                  <li>Each block depends on all previous blocks</li>
                  <li>More secure than ECB</li>
                </ul>
              </div>
              <div className="mt-2 text-sm">
                <p className="font-medium">Cons:</p>
                <ul className="list-disc list-inside ml-2 mt-1">
                  <li>Not parallelizable for encryption</li>
                  <li>Requires an IV</li>
                  <li>Error propagation</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 border rounded-md bg-card">
              <h3 className="font-medium mb-2">CTR Mode</h3>
              <div className="aspect-w-4 aspect-h-3 bg-muted/30 rounded-md mb-3 flex items-center justify-center">
                <div className="grid grid-cols-4 gap-1 p-2">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="w-full aspect-square bg-primary/20 border border-primary/40 rounded-sm" style={{ 
                      backgroundColor: `hsla(${(i * 40) % 360}, 70%, 60%, 0.2)`,
                      borderColor: `hsla(${(i * 40) % 360}, 70%, 60%, 0.4)`
                    }}></div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Counter mode turns a block cipher into a stream cipher by encrypting 
                sequential counter values and XORing the result with the plaintext.
              </p>
              <div className="mt-3 text-sm">
                <p className="font-medium">Pros:</p>
                <ul className="list-disc list-inside ml-2 mt-1">
                  <li>Parallelizable for both encryption and decryption</li>
                  <li>No padding required</li>
                  <li>Random access to encrypted data</li>
                </ul>
              </div>
              <div className="mt-2 text-sm">
                <p className="font-medium">Cons:</p>
                <ul className="list-disc list-inside ml-2 mt-1">
                  <li>Requires a unique nonce/IV for each message</li>
                  <li>Bit flipping attacks possible</li>
                  <li>No authentication</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Educational Section */}
        <motion.div
          className="step-container mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-4">How AES Works</h2>
          
          <div className="space-y-4">
            <p>
              The Advanced Encryption Standard (AES) is a symmetric block cipher that processes 
              data in fixed-size blocks of 128 bits (16 bytes). It supports key sizes of 128, 
              192, and 256 bits, with the number of rounds depending on the key size.
            </p>
            
            <div className="p-4 border rounded-md bg-muted/30">
              <h3 className="font-medium mb-2 flex items-center">
                AES Encryption Process <Info className="info-tooltip ml-2" />
              </h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Key Expansion: The original key is expanded into a key schedule.</li>
                <li>Initial Round:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>AddRoundKey: XOR the state with the round key.</li>
                  </ul>
                </li>
                <li>Main Rounds (9, 11, or 13 rounds depending on key size):
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>SubBytes: Substitute each byte using an S-box.</li>
                    <li>ShiftRows: Shift rows of the state array.</li>
                    <li>MixColumns: Mix data within each column.</li>
                    <li>AddRoundKey: XOR the state with the round key.</li>
                  </ul>
                </li>
                <li>Final Round:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>SubBytes: Substitute each byte using an S-box.</li>
                    <li>ShiftRows: Shift rows of the state array.</li>
                    <li>AddRoundKey: XOR the state with the round key.</li>
                  </ul>
                </li>
              </ol>
            </div>
            
            <div className="p-4 border rounded-md bg-muted/30">
              <h3 className="font-medium mb-2">AES State Matrix</h3>
              <p className="mb-3">
                AES operates on a 4×4 matrix of bytes called the "state". Each operation 
                transforms this state until the final ciphertext is produced.
              </p>
              <div className="flex justify-center mb-3">
                <div className="matrix-grid">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="matrix-cell">
                      {i < 10 ? `0${i}` : i}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                The state matrix is filled column by column from the input data.
              </p>
            </div>
            
            <div className="p-4 border rounded-md bg-muted/30">
              <h3 className="font-medium mb-2">Security Considerations</h3>
              <p className="mb-2">
                AES is considered secure against all known practical attacks when implemented correctly:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use a secure mode of operation (CBC or CTR, not ECB).</li>
                <li>Generate a unique IV for each encryption operation.</li>
                <li>Consider using authenticated encryption (e.g., AES-GCM) for integrity.</li>
                <li>Protect encryption keys using secure key management practices.</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Quiz Section */}
        <motion.div
          className="quiz-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-semibold mb-4">Test Your Knowledge</h2>
          
          <div className="p-4 border rounded-md bg-card">
            <p className="quiz-question">
              Which AES mode uses an initialization vector (IV) and chains blocks together for better security?
            </p>
            
            <div className="mt-4">
              <Label htmlFor="quiz-answer">Your answer:</Label>
              <div className="flex mt-1">
                <Input
                  id="quiz-answer"
                  value={quizAnswer}
                  onChange={(e) => setQuizAnswer(e.target.value)}
                  placeholder="Enter your answer"
                  className="mr-2"
                  disabled={quizFeedback !== null}
                />
                {quizFeedback === null ? (
                  <Button onClick={checkQuizAnswer}>Check</Button>
                ) : (
                  <Button variant="outline" onClick={resetQuiz}>Try Again</Button>
                )}
              </div>
            </div>
            
            {quizFeedback && (
              <div className={`quiz-feedback ${quizFeedback.correct ? 'correct' : 'incorrect'}`}>
                <div className="flex items-start">
                  {quizFeedback.correct ? (
                    <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                  ) : (
                    <X className="h-5 w-5 mr-2 flex-shrink-0" />
                  )}
                  <p>{quizFeedback.message}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default AESPage