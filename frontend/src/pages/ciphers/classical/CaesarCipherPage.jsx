import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Info, ArrowRight, RefreshCw, Check, X } from 'lucide-react'
import { encryptionService } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const CaesarCipherPage = () => {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('encrypt')
  const [plaintext, setPlaintext] = useState('HELLO')
  const [ciphertext, setCiphertext] = useState('')
  const [shift, setShift] = useState(3)
  const [steps, setSteps] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showAllSteps, setShowAllSteps] = useState(false)
  const [quizAnswer, setQuizAnswer] = useState('')
  const [quizFeedback, setQuizFeedback] = useState(null)

  // Process encryption/decryption
  const processText = async () => {
    setIsLoading(true)
    try {
      if (activeTab === 'encrypt') {
        const result = await encryptionService.encrypt(plaintext, 'caesar', shift.toString())
        setCiphertext(result.ciphertext)
        setSteps(result.steps)
      } else {
        const result = await encryptionService.decrypt(ciphertext, 'caesar', shift.toString())
        setPlaintext(result.plaintext)
        setSteps(result.steps)
      }
      setCurrentStep(0)
      setShowAllSteps(false)
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

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value)
    setSteps([])
    setCurrentStep(0)
    setShowAllSteps(false)
  }

  // Check quiz answer
  const checkQuizAnswer = () => {
    const correctAnswer = 'KHOOR'
    if (quizAnswer.toUpperCase() === correctAnswer) {
      setQuizFeedback({
        correct: true,
        message: 'Correct! You\'ve successfully encrypted "HELLO" with a shift of 3.'
      })
    } else {
      setQuizFeedback({
        correct: false,
        message: `Incorrect. The correct encryption of "HELLO" with a shift of 3 is "${correctAnswer}".`
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
        <h1 className="text-3xl font-bold mb-2">Caesar Cipher</h1>
        <p className="text-muted-foreground mb-6">
          A substitution cipher where each letter is shifted by a fixed number of positions in the alphabet.
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
                <div className="flex justify-between">
                  <Label htmlFor="shift">Shift Value: {shift}</Label>
                </div>
                <Slider
                  id="shift"
                  min={1}
                  max={25}
                  step={1}
                  value={[shift]}
                  onValueChange={(value) => setShift(value[0])}
                />
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
                  <Label className="block mb-2">Result:</Label>
                  <p className="text-xl font-mono">{ciphertext}</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="decrypt" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="ciphertext">Ciphertext</Label>
                <Input
                  id="ciphertext"
                  value={ciphertext}
                  onChange={(e) => setCiphertext(e.target.value)}
                  placeholder="Enter text to decrypt"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="shift-decrypt">Shift Value: {shift}</Label>
                </div>
                <Slider
                  id="shift-decrypt"
                  min={1}
                  max={25}
                  step={1}
                  value={[shift]}
                  onValueChange={(value) => setShift(value[0])}
                />
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
                  <Label className="block mb-2">Result:</Label>
                  <p className="text-xl font-mono">{plaintext}</p>
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
              <h2 className="text-xl font-semibold">Step-by-Step Visualization</h2>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllSteps(!showAllSteps)}
                >
                  {showAllSteps ? 'Show Current Step' : 'Show All Steps'}
                </Button>
              </div>
            </div>

            <div className="animation-container">
              {showAllSteps ? (
                // Show all steps at once
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {steps.map((step, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-md bg-card"
                    >
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Character: {step.original_char}</span>
                        <span className="text-muted-foreground">Position: {index}</span>
                      </div>
                      
                      {step.is_letter ? (
                        <>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Original: {step.original_char}</div>
                            <div>ASCII: {step.ascii_value}</div>
                            <div>Position in alphabet: {step.position_in_alphabet}</div>
                            <div>Shift: {step.shift_value}</div>
                            <div>New position: {step.shifted_position}</div>
                            <div>Result: {step.result_char}</div>
                          </div>
                          
                          <div className="flex items-center justify-center mt-3 space-x-2">
                            <div className="character-box">{step.original_char}</div>
                            <ArrowRight className="arrow-right" />
                            <div className="character-box highlight">{step.result_char}</div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-2">
                          Non-alphabetic character (unchanged)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // Show one step at a time
                <div>
                  <div className="flex justify-between mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                    >
                      Previous
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
                      Next
                    </Button>
                  </div>
                  
                  {steps[currentStep] && (
                    <div className="p-4 border rounded-md bg-card">
                      <div className="flex justify-between mb-3">
                        <span className="font-medium">Character: {steps[currentStep].original_char}</span>
                        <span className="text-muted-foreground">Position: {currentStep}</span>
                      </div>
                      
                      {steps[currentStep].is_letter ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Original character:</span>
                                <span className="font-mono">{steps[currentStep].original_char}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>ASCII value:</span>
                                <span className="font-mono">{steps[currentStep].ascii_value}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Position in alphabet:</span>
                                <span className="font-mono">{steps[currentStep].position_in_alphabet}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Shift value:</span>
                                <span className="font-mono">{steps[currentStep].shift_value}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>New position:</span>
                                <span className="font-mono">{steps[currentStep].shifted_position}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Result character:</span>
                                <span className="font-mono">{steps[currentStep].result_char}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center mt-4">
                            <div className="text-sm text-muted-foreground mb-2">
                              {activeTab === 'encrypt' ? 'Encryption' : 'Decryption'} Formula:
                              {activeTab === 'encrypt' 
                                ? ` (position + shift) % 26 = new position`
                                : ` (position - shift + 26) % 26 = new position`}
                            </div>
                            
                            <div className="flex items-center justify-center space-x-4 mt-2">
                              <div className="character-box">{steps[currentStep].original_char}</div>
                              <div className="flex flex-col items-center">
                                <ArrowRight className="arrow-right" />
                                <span className="text-xs text-muted-foreground">
                                  Shift {steps[currentStep].shift_value}
                                </span>
                              </div>
                              <div className="character-box highlight">{steps[currentStep].result_char}</div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-6">
                          <p>This is a non-alphabetic character.</p>
                          <p className="text-muted-foreground">Non-alphabetic characters remain unchanged.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Educational Section */}
        <motion.div
          className="step-container mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold mb-4">How Caesar Cipher Works</h2>
          
          <div className="space-y-4">
            <p>
              The Caesar cipher is one of the simplest and oldest known encryption techniques. 
              Named after Julius Caesar, who reportedly used it to communicate with his generals, 
              this cipher is a type of substitution cipher where each letter in the plaintext is 
              shifted a certain number of places down the alphabet.
            </p>
            
            <div className="p-4 border rounded-md bg-muted/30">
              <h3 className="font-medium mb-2 flex items-center">
                Encryption Process <Info className="info-tooltip ml-2" />
              </h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Choose a shift value (key) between 1 and 25.</li>
                <li>For each letter in the plaintext:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Convert the letter to its position in the alphabet (A=0, B=1, ..., Z=25).</li>
                    <li>Add the shift value to the position.</li>
                    <li>Take the result modulo 26 (to wrap around the alphabet).</li>
                    <li>Convert the new position back to a letter.</li>
                  </ul>
                </li>
                <li>Non-alphabetic characters remain unchanged.</li>
              </ol>
            </div>
            
            <div className="p-4 border rounded-md bg-muted/30">
              <h3 className="font-medium mb-2 flex items-center">
                Decryption Process <Info className="info-tooltip ml-2" />
              </h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Use the same shift value used for encryption.</li>
                <li>For each letter in the ciphertext:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Convert the letter to its position in the alphabet.</li>
                    <li>Subtract the shift value from the position.</li>
                    <li>Add 26 and take the result modulo 26 (to handle negative numbers).</li>
                    <li>Convert the new position back to a letter.</li>
                  </ul>
                </li>
                <li>Non-alphabetic characters remain unchanged.</li>
              </ol>
            </div>
            
            <div className="p-4 border rounded-md bg-muted/30">
              <h3 className="font-medium mb-2">Security Considerations</h3>
              <p>
                The Caesar cipher is extremely weak by modern standards because:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>There are only 25 possible keys (shifts).</li>
                <li>It can be easily broken using frequency analysis.</li>
                <li>A brute force attack can try all possible shifts very quickly.</li>
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
              Encrypt the word "HELLO" using a Caesar cipher with a shift of 3.
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

export default CaesarCipherPage