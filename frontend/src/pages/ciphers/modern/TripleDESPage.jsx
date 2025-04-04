import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Info, ArrowRight, RefreshCw, Check, X, Copy, Eye, EyeOff, Lock, Unlock, ArrowDown } from 'lucide-react'
import { encryptionService } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { generateRandomKey } from '@/lib/utils'

const TripleDESPage = () => {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('encrypt')
  const [plaintext, setPlaintext] = useState('This is a secret message')
  const [ciphertext, setCiphertext] = useState('')
  const [key, setKey] = useState('mysecretkey12345')
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
        const result = await encryptionService.encrypt(plaintext, '3des', key)
        setCiphertext(result.ciphertext)
        setIv(result.iv || '')
        setSteps(result.steps)
      } else {
        const result = await encryptionService.decrypt(ciphertext, '3des', key, { iv })
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
    const correctAnswer = '3'
    if (quizAnswer === correctAnswer) {
      setQuizFeedback({
        correct: true,
        message: 'Correct! Triple DES applies the DES algorithm three times to each data block.'
      })
    } else {
      setQuizFeedback({
        correct: false,
        message: `Incorrect. Triple DES applies the DES algorithm ${correctAnswer} times to each data block.`
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
        <h1 className="text-3xl font-bold mb-2">Triple DES (3DES)</h1>
        <p className="text-muted-foreground mb-6">
          A symmetric-key block cipher that applies the DES cipher algorithm three times to each data block.
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
                  For 3DES, the key will be derived to 24 bytes (192 bits).
                </p>
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
                        Save this IV for decryption (required for CBC mode).
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
                <Label htmlFor="iv">Initialization Vector (IV)</Label>
                <Input
                  id="iv"
                  value={iv}
                  onChange={(e) => setIv(e.target.value)}
                  placeholder="Enter Base64-encoded IV"
                />
                <p className="text-xs text-muted-foreground">
                  Required for decryption.
                </p>
              </div>
              
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
                  
                  {steps[currentStep].step === 'Encryption' && (
                    <div className="space-y-3">
                      <div>
                        <Label className="block mb-1">Mode:</Label>
                        <p className="font-mono">{steps[currentStep].mode}</p>
                      </div>
                      
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
                        <Label className="block mb-1">Mode:</Label>
                        <p className="font-mono">{steps[currentStep].mode}</p>
                      </div>
                      
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

        {/* Triple DES Process Visualization */}
        <motion.div
          className="step-container mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-4">Triple DES Process</h2>
          
          <div className="p-4 border rounded-md bg-muted/30">
            <div className="flex flex-col items-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div className="p-4 border rounded-md bg-card flex flex-col items-center">
                  <h3 className="font-medium mb-3">Step 1: Encrypt</h3>
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                    <Lock className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-sm text-center">
                    Encrypt the plaintext using the first 56 bits of the key
                  </p>
                </div>
                
                <div className="p-4 border rounded-md bg-card flex flex-col items-center">
                  <h3 className="font-medium mb-3">Step 2: Decrypt</h3>
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                    <Unlock className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-sm text-center">
                    Decrypt the result using the middle 56 bits of the key
                  </p>
                </div>
                
                <div className="p-4 border rounded-md bg-card flex flex-col items-center">
                  <h3 className="font-medium mb-3">Step 3: Encrypt</h3>
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
                    <Lock className="h-8 w-8 text-purple-500" />
                  </div>
                  <p className="text-sm text-center">
                    Encrypt the result again using the last 56 bits of the key
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="p-3 border rounded-md bg-card">
                  <p className="text-sm font-mono">Plaintext</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="p-3 border rounded-md bg-blue-100 dark:bg-blue-900/30">
                  <p className="text-sm font-mono">Intermediate 1</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="p-3 border rounded-md bg-green-100 dark:bg-green-900/30">
                  <p className="text-sm font-mono">Intermediate 2</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="p-3 border rounded-md bg-card">
                  <p className="text-sm font-mono">Ciphertext</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Educational Section */}
        <motion.div
          className="step-container mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold mb-4">How Triple DES Works</h2>
          
          <div className="space-y-4">
            <p>
              Triple DES (3DES) is a symmetric-key block cipher that applies the Data Encryption 
              Standard (DES) cipher algorithm three times to each data block. It was developed 
              to address the increasing vulnerability of DES to brute force attacks.
            </p>
            
            <div className="p-4 border rounded-md bg-muted/30">
              <h3 className="font-medium mb-2 flex items-center">
                Triple DES Process <Info className="info-tooltip ml-2" />
              </h3>
              <p className="mb-3">
                Triple DES uses a "encrypt-decrypt-encrypt" (EDE) process with three keys:
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Encrypt the plaintext using the first key (K1).</li>
                <li>Decrypt the result using the second key (K2).</li>
                <li>Encrypt the result again using the third key (K3).</li>
              </ol>
              <p className="mt-3 text-sm text-muted-foreground">
                The formula can be written as: C = E(K3, D(K2, E(K1, P)))
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Where E is encryption, D is decryption, P is plaintext, and C is ciphertext.
              </p>
            </div>
            
            <div className="p-4 border rounded-md bg-muted/30">
              <h3 className="font-medium mb-2 flex items-center">
                Key Variants <Info className="info-tooltip ml-2" />
              </h3>
              <p className="mb-3">
                Triple DES can be used with different key configurations:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Three-key Triple DES</strong>: Uses three different keys (K1, K2, K3) for a total of 168 bits.</li>
                <li><strong>Two-key Triple DES</strong>: Uses two keys where K1 = K3, for a total of 112 bits.</li>
                <li><strong>One-key Triple DES</strong>: Uses the same key for all operations (K1 = K2 = K3), equivalent to single DES.</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-md bg-muted/30">
              <h3 className="font-medium mb-2">Block Size and Mode</h3>
              <p className="mb-3">
                Triple DES operates on 64-bit (8-byte) blocks of data. Like other block ciphers, 
                it can be used with different modes of operation:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>CBC (Cipher Block Chaining)</strong>: Each block is XORed with the previous ciphertext block before encryption.</li>
                <li><strong>ECB (Electronic Codebook)</strong>: Each block is encrypted independently (not recommended for most applications).</li>
                <li><strong>CFB (Cipher Feedback)</strong>: Transforms a block cipher into a stream cipher.</li>
                <li><strong>OFB (Output Feedback)</strong>: Generates keystream blocks that are XORed with plaintext.</li>
              </ul>
              <p className="mt-3 text-sm">
                Our implementation uses CBC mode for better security.
              </p>
            </div>
            
            <div className="p-4 border rounded-md bg-muted/30">
              <h3 className="font-medium mb-2">Security Considerations</h3>
              <p className="mb-2">
                Triple DES provides significantly more security than single DES, but has some limitations:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Slower than modern algorithms like AES.</li>
                <li>Vulnerable to meet-in-the-middle attacks (effective security of 112 bits for three-key variant).</li>
                <li>Block size of 64 bits is smaller than modern standards (128 bits).</li>
                <li>Being phased out in favor of AES for most applications.</li>
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
              How many times does Triple DES apply the DES algorithm to each data block?
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

export default TripleDESPage