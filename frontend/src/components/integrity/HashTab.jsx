import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, RefreshCw, Copy, Info } from 'lucide-react'
import { integrityService } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatHex } from '@/lib/utils'
import HashVisualization from './HashVisualization'
import AvalancheEffect from './AvalancheEffect'

const HashTab = () => {
  const { toast } = useToast()
  const [message, setMessage] = useState('Hello, World!')
  const [algorithm, setAlgorithm] = useState('sha256')
  const [hashResult, setHashResult] = useState(null)
  const [steps, setSteps] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showAllSteps, setShowAllSteps] = useState(false)
  
  // For avalanche effect demonstration
  const [modifiedMessage, setModifiedMessage] = useState('Hello, World?')
  const [modifiedHash, setModifiedHash] = useState(null)

  // Compute hash
  const computeHash = async () => {
    if (!message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a message'
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await integrityService.computeHash(message, algorithm)
      setHashResult(result)
      setSteps(result.steps)
      setCurrentStep(0)
      
      // Also compute hash for modified message to show avalanche effect
      const modifiedResult = await integrityService.computeHash(modifiedMessage, algorithm)
      setModifiedHash(modifiedResult.hash)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error || 'An error occurred during hash computation'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Copy hash to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: 'Hash copied to clipboard'
    })
  }

  // Update modified message when original message changes
  useEffect(() => {
    // Create a modified message by changing the last character
    if (message.length > 0) {
      const lastChar = message.charAt(message.length - 1)
      const newLastChar = lastChar === '!' ? '?' : (lastChar === '?' ? '.' : '!')
      setModifiedMessage(message.slice(0, -1) + newLastChar)
    }
  }, [message])

  // Process initial hash computation on component mount or algorithm change
  useEffect(() => {
    computeHash()
  }, [algorithm])

  return (
    <div className="space-y-8">
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
                  placeholder="Enter message to hash"
                  className="font-mono mt-1.5"
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="algorithm">Hash Algorithm</Label>
                <Select value={algorithm} onValueChange={setAlgorithm}>
                  <SelectTrigger id="algorithm" className="mt-1.5">
                    <SelectValue placeholder="Select algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="md5">MD5</SelectItem>
                    <SelectItem value="sha1">SHA-1</SelectItem>
                    <SelectItem value="sha256">SHA-256</SelectItem>
                    <SelectItem value="sha512">SHA-512</SelectItem>
                  </SelectContent>
                </Select>
                
                {(algorithm === 'md5' || algorithm === 'sha1') && (
                  <div className="flex items-center mt-2 text-amber-600 dark:text-amber-400 text-sm">
                    <Info className="h-4 w-4 mr-1" />
                    <span>Warning: {algorithm.toUpperCase()} is considered cryptographically broken and should not be used for security-critical applications.</span>
                  </div>
                )}
              </div>
              
              <Button onClick={computeHash} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Compute Hash
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
                  <Label>Hash Result ({algorithm.toUpperCase()})</Label>
                  {hashResult && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(hashResult.hash)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="p-3 bg-muted rounded-md mt-1.5 overflow-x-auto">
                  <p className="font-mono text-sm break-all">
                    {hashResult ? hashResult.hash : 'Computing...'}
                  </p>
                </div>
              </div>
              
              <div>
                <Label>Message in Hexadecimal</Label>
                <div className="p-3 bg-muted rounded-md mt-1.5 overflow-x-auto">
                  <p className="font-mono text-sm break-all">
                    {hashResult ? formatHex(hashResult.message_hex) : 'Computing...'}
                  </p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <Label>Hash Properties</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1 rounded-full bg-muted cursor-help">
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Key properties of cryptographic hash functions</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  <div className="p-2 border rounded-md">
                    <p className="text-sm font-medium">Fixed Output Size</p>
                    <p className="text-xs text-muted-foreground">
                      {algorithm === 'md5' && '128 bits (16 bytes)'}
                      {algorithm === 'sha1' && '160 bits (20 bytes)'}
                      {algorithm === 'sha256' && '256 bits (32 bytes)'}
                      {algorithm === 'sha512' && '512 bits (64 bytes)'}
                    </p>
                  </div>
                  <div className="p-2 border rounded-md">
                    <p className="text-sm font-medium">Deterministic</p>
                    <p className="text-xs text-muted-foreground">
                      Same input always produces the same output
                    </p>
                  </div>
                  <div className="p-2 border rounded-md">
                    <p className="text-sm font-medium">Pre-image Resistance</p>
                    <p className="text-xs text-muted-foreground">
                      Infeasible to find input from hash
                    </p>
                  </div>
                  <div className="p-2 border rounded-md">
                    <p className="text-sm font-medium">Collision Resistance</p>
                    <p className="text-xs text-muted-foreground">
                      Difficult to find two inputs with same hash
                    </p>
                  </div>
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
            <h2 className="text-2xl font-semibold">Hash Computation Process</h2>
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
                <HashVisualization key={index} step={step} />
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
              
              <HashVisualization step={steps[currentStep]} />
            </div>
          )}
        </motion.div>
      )}

      {/* Avalanche Effect Section */}
      {hashResult && modifiedHash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold">Avalanche Effect</h2>
          
          <Card>
            <CardContent className="pt-6">
              <AvalancheEffect
                originalMessage={message}
                modifiedMessage={modifiedMessage}
                originalHash={hashResult.hash}
                modifiedHash={modifiedHash}
                algorithm={algorithm}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Educational Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-semibold">How Hash Functions Work</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-3">Hash Function Process</h3>
              <ol className="space-y-3 list-decimal list-inside">
                <li className="pl-2">
                  <span className="font-medium">Input Preparation:</span> The message is converted to binary format.
                </li>
                <li className="pl-2">
                  <span className="font-medium">Padding:</span> The message is padded to ensure it's a multiple of the block size.
                </li>
                <li className="pl-2">
                  <span className="font-medium">Block Processing:</span> The message is processed in fixed-size blocks through multiple rounds of operations.
                </li>
                <li className="pl-2">
                  <span className="font-medium">Compression:</span> Each block is combined with the result of the previous block.
                </li>
                <li className="pl-2">
                  <span className="font-medium">Final Output:</span> After all blocks are processed, the final hash value is produced.
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-3">Applications of Hash Functions</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 bg-primary/20 text-primary rounded-full p-1">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-medium">Data Integrity:</span> Verify that data hasn't been altered during transmission or storage.
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 bg-primary/20 text-primary rounded-full p-1">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-medium">Password Storage:</span> Store password hashes instead of plaintext passwords.
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 bg-primary/20 text-primary rounded-full p-1">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-medium">Digital Signatures:</span> Used as part of digital signature schemes.
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 bg-primary/20 text-primary rounded-full p-1">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-medium">File Identification:</span> Generate unique identifiers for files.
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-3">Common Hash Algorithms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-md">
                <h4 className="font-medium mb-2">MD5 (Message Digest 5)</h4>
                <p className="text-sm text-muted-foreground">
                  Produces a 128-bit hash value. <span className="text-red-500 dark:text-red-400">Considered cryptographically broken</span> and should not be used for security purposes.
                </p>
              </div>
              <div className="p-4 border rounded-md">
                <h4 className="font-medium mb-2">SHA-1 (Secure Hash Algorithm 1)</h4>
                <p className="text-sm text-muted-foreground">
                  Produces a 160-bit hash value. <span className="text-red-500 dark:text-red-400">Vulnerable to collision attacks</span> and no longer recommended for security applications.
                </p>
              </div>
              <div className="p-4 border rounded-md">
                <h4 className="font-medium mb-2">SHA-256</h4>
                <p className="text-sm text-muted-foreground">
                  Part of the SHA-2 family, produces a 256-bit hash value. Widely used and considered secure for most applications.
                </p>
              </div>
              <div className="p-4 border rounded-md">
                <h4 className="font-medium mb-2">SHA-512</h4>
                <p className="text-sm text-muted-foreground">
                  Also part of the SHA-2 family, produces a 512-bit hash value. Provides a higher security margin than SHA-256.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default HashTab