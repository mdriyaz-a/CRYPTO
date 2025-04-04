import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Info, ArrowRight, RefreshCw, Copy, ArrowDown } from 'lucide-react'
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
import { formatBinary, formatHex, generateColorsFromHash, hexToColor } from '@/lib/utils'
import HashVisualization from './HashVisualization'
import AvalancheEffect from './AvalancheEffect'

const HashFunctionsTab = () => {
  const { toast } = useToast()
  const [message, setMessage] = useState('Hello, World!')
  const [algorithm, setAlgorithm] = useState('sha256')
  const [hashResult, setHashResult] = useState(null)
  const [steps, setSteps] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showAllSteps, setShowAllSteps] = useState(false)
  const [comparisonMessage, setComparisonMessage] = useState('Hello, World?')
  const [comparisonHash, setComparisonHash] = useState(null)
  const [isComparing, setIsComparing] = useState(false)

  // Compute hash
  const computeHash = async () => {
    if (!message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a message to hash'
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await integrityService.computeHash(message, algorithm)
      setHashResult(result)
      setSteps(result.steps)
      setCurrentStep(0)
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

  // Compute comparison hash
  const computeComparisonHash = async () => {
    if (!comparisonMessage) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a comparison message'
      })
      return
    }

    setIsComparing(true)
    try {
      const result = await integrityService.computeHash(comparisonMessage, algorithm)
      setComparisonHash(result)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error || 'An error occurred during hash computation'
      })
    } finally {
      setIsComparing(false)
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

  // Process initial hash on component mount or algorithm change
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
                    <SelectItem value="md5">MD5 (128 bits)</SelectItem>
                    <SelectItem value="sha1">SHA-1 (160 bits)</SelectItem>
                    <SelectItem value="sha256">SHA-256 (256 bits)</SelectItem>
                    <SelectItem value="sha512">SHA-512 (512 bits)</SelectItem>
                  </SelectContent>
                </Select>
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
              
              <div className="flex items-center space-x-2">
                <div className="w-full h-8 rounded-md overflow-hidden flex">
                  {hashResult && generateColorsFromHash(hashResult.hash, 16).map((color, index) => (
                    <div 
                      key={index} 
                      className="h-full flex-1" 
                      style={{ backgroundColor: color }}
                      title={`Byte ${index + 1}`}
                    />
                  ))}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Visual representation of the hash value</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-semibold">Avalanche Effect Demonstration</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="comparison-message">Comparison Message</Label>
                  <Textarea
                    id="comparison-message"
                    value={comparisonMessage}
                    onChange={(e) => setComparisonMessage(e.target.value)}
                    placeholder="Enter a slightly different message"
                    className="font-mono mt-1.5"
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Try changing just one character to see how it affects the hash.
                  </p>
                </div>
                
                <Button onClick={computeComparisonHash} disabled={isComparing} className="w-full">
                  {isComparing ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  Compute Comparison Hash
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              {comparisonHash && hashResult && (
                <AvalancheEffect 
                  originalMessage={message}
                  modifiedMessage={comparisonMessage}
                  originalHash={hashResult.hash}
                  modifiedHash={comparisonHash.hash}
                  algorithm={algorithm}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

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
              <h3 className="text-lg font-medium mb-3">Key Properties</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 bg-primary/20 text-primary rounded-full p-1">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-medium">One-way function:</span> It's computationally infeasible to reverse a hash to find the original message.
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 bg-primary/20 text-primary rounded-full p-1">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-medium">Deterministic:</span> The same input will always produce the same hash output.
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 bg-primary/20 text-primary rounded-full p-1">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-medium">Avalanche effect:</span> A small change in the input results in a significantly different hash output.
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 bg-primary/20 text-primary rounded-full p-1">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-medium">Collision resistance:</span> It should be difficult to find two different inputs that produce the same hash.
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-3">Common Applications</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 bg-primary/20 text-primary rounded-full p-1">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-medium">Data integrity:</span> Verify that data hasn't been altered during transmission or storage.
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 bg-primary/20 text-primary rounded-full p-1">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-medium">Password storage:</span> Store password hashes instead of plaintext passwords.
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 bg-primary/20 text-primary rounded-full p-1">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-medium">Digital signatures:</span> Create and verify digital signatures in combination with asymmetric encryption.
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 bg-primary/20 text-primary rounded-full p-1">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-medium">File identification:</span> Generate unique identifiers for files (checksums).
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-3">Hash Algorithm Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Algorithm</th>
                    <th className="text-left py-2 px-4">Output Size</th>
                    <th className="text-left py-2 px-4">Block Size</th>
                    <th className="text-left py-2 px-4">Security Status</th>
                    <th className="text-left py-2 px-4">Use Cases</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4">MD5</td>
                    <td className="py-2 px-4">128 bits</td>
                    <td className="py-2 px-4">512 bits</td>
                    <td className="py-2 px-4 text-destructive">Broken (vulnerable to collisions)</td>
                    <td className="py-2 px-4">Legacy systems, non-security critical checksums</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">SHA-1</td>
                    <td className="py-2 px-4">160 bits</td>
                    <td className="py-2 px-4">512 bits</td>
                    <td className="py-2 px-4 text-destructive">Broken (vulnerable to collisions)</td>
                    <td className="py-2 px-4">Legacy systems, being phased out</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">SHA-256</td>
                    <td className="py-2 px-4">256 bits</td>
                    <td className="py-2 px-4">512 bits</td>
                    <td className="py-2 px-4 text-primary">Secure</td>
                    <td className="py-2 px-4">Digital signatures, certificates, blockchain</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">SHA-512</td>
                    <td className="py-2 px-4">512 bits</td>
                    <td className="py-2 px-4">1024 bits</td>
                    <td className="py-2 px-4 text-primary">Secure</td>
                    <td className="py-2 px-4">High-security applications, password hashing</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default HashFunctionsTab