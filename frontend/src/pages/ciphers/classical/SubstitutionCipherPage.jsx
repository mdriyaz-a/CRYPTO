import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Info, ArrowRight, RefreshCw, Check, X, Shuffle, ArrowDown } from 'lucide-react'
import { encryptionService } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const SubstitutionCipherPage = () => {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('encrypt')
  const [plaintext, setPlaintext] = useState('HELLO WORLD')
  const [ciphertext, setCiphertext] = useState('')
  const [key, setKey] = useState('QWERTYUIOPASDFGHJKLZXCVBNM')
  const [steps, setSteps] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showAllSteps, setShowAllSteps] = useState(false)
  const [quizAnswer, setQuizAnswer] = useState('')
  const [quizFeedback, setQuizFeedback] = useState(null)

  // Process encryption/decryption
  const processText = async () => {
    if (key.length !== 26) {
      toast({
        variant: 'destructive',
        title: 'Invalid Key',
        description: 'The key must contain all 26 letters of the alphabet exactly once.'
      })
      return
    }

    setIsLoading(true)
    try {
      if (activeTab === 'encrypt') {
        const result = await encryptionService.encrypt(plaintext, 'substitution', key)
        setCiphertext(result.ciphertext)
        setSteps(result.steps)
      } else {
        const result = await encryptionService.decrypt(ciphertext, 'substitution', key)
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

  // Generate a random substitution key
  const generateRandomKey = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    for (let i = alphabet.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]]
    }
    const newKey = alphabet.join('')
    setKey(newKey)
    toast({
      title: 'Random Key Generated',
      description: 'A new random substitution key has been created.'
    })
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
    const correctAnswer = 'SUBSTITUTION'
    if (quizAnswer.toUpperCase() === correctAnswer) {
      setQuizFeedback({
        correct: true,
        message: 'Correct! The substitution cipher replaces each letter with another letter according to a fixed mapping.'
      })
    } else {
      setQuizFeedback({
        correct: false,
        message: `Incorrect. The correct answer is "${correctAnswer}".`
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
        <h1 className="text-3xl font-bold mb-2">Substitution Cipher</h1>
        <p className="text-muted-foreground mb-6">
          A method where each letter is replaced with another letter according to a fixed mapping.
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
                  <Label htmlFor="key">Substitution Key (26 letters)</Label>
                  <Button variant="outline" size="sm" onClick={generateRandomKey}>
                    <Shuffle className="mr-2 h-4 w-4" />
                    Generate Key
                  </Button>
                </div>
                <Input
                  id="key"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                  placeholder="Enter substitution key (26 letters)"
                  maxLength={26}
                />
                <p className="text-xs text-muted-foreground">
                  The key must contain all 26 letters of the alphabet exactly once.
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
                <div className="flex justify-between items-center">
                  <Label htmlFor="key-decrypt">Substitution Key (26 letters)</Label>
                  <Button variant="outline" size="sm" onClick={generateRandomKey}>
                    <Shuffle className="mr-2 h-4 w-4" />
                    Generate Key
                  </Button>
                </div>
                <Input
                  id="key-decrypt"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                  placeholder="Enter substitution key (26 letters)"
                  maxLength={26}
                />
                <p className="text-xs text-muted-foreground">
                  The key must contain all 26 letters of the alphabet exactly once.
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
                            <div>Case: {step.case}</div>
                            <div>Mapping: {step.mapping}</div>
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
                                <span>Case:</span>
                                <span className="font-mono">{steps[currentStep].case}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Mapping:</span>
                                <span className="font-mono">{steps[currentStep].mapping}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Result character:</span>
                                <span className="font-mono">{steps[currentStep].result_char}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center mt-4">
                            <div className="text-sm text-muted-foreground mb-2">
                              {activeTab === 'encrypt' ? 'Encryption' : 'Decryption'} Process:
                              {activeTab === 'encrypt' 
                                ? ' Each letter is replaced according to the key mapping'
                                : ' Each letter is reversed according to the key mapping'}
                            </div>
                            
                            <div className="flex items-center justify-center space-x-4 mt-2">
                              <div className="character-box">{steps[currentStep].original_char}</div>
                              <div className="flex flex-col items-center">
                                <ArrowRight className="arrow-right" />
                                <span className="text-xs text-muted-foreground">
                                  Substitution
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

        {/* Key Mapping Visualization */}
        <motion.div
          className="step-container mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-4">Key Mapping</h2>
          
          <div className="p-4 border rounded-md bg-muted/30">
            <div className="grid grid-cols-13 md:grid-cols-26 gap-1 mb-4">
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((char, index) => (
                <div key={index} className="character-box text-center text-sm">
                  {char}
                </div>
              ))}
            </div>
            <div className="flex justify-center mb-2">
              <ArrowDown className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-13 md:grid-cols-26 gap-1">
              {key.split('').map((char, index) => (
                <div key={index} className="character-box text-center text-sm highlight">
                  {char}
                </div>
              ))}
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
          <h2 className="text-xl font-semibold mb-4">How Substitution Cipher Works</h2>
          
          <div className="space-y-4">
            <p>
              The substitution cipher is a method of encrypting text by replacing each letter 
              with another letter according to a fixed mapping. Unlike the Caesar cipher, which 
              uses a simple shift, the substitution cipher can use any arrangement of the alphabet.
            </p>
            
            <div className="p-4 border rounded-md bg-muted/30">
              <h3 className="font-medium mb-2 flex items-center">
                Encryption Process <Info className="info-tooltip ml-2" />
              </h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Create a key that maps each letter of the alphabet to another letter.</li>
                <li>For each letter in the plaintext:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Find the corresponding letter in the key.</li>
                    <li>Replace the plaintext letter with the mapped letter.</li>
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
                <li>Use the same key used for encryption.</li>
                <li>For each letter in the ciphertext:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Find the position of the letter in the key.</li>
                    <li>Replace with the letter at the same position in the standard alphabet.</li>
                  </ul>
                </li>
                <li>Non-alphabetic characters remain unchanged.</li>
              </ol>
            </div>
            
            <div className="p-4 border rounded-md bg-muted/30">
              <h3 className="font-medium mb-2">Security Considerations</h3>
              <p>
                The substitution cipher is stronger than the Caesar cipher because:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>There are 26! (factorial) possible keys, which is approximately 4 × 10²⁶.</li>
                <li>This makes brute force attacks impractical.</li>
              </ul>
              <p className="mt-2">
                However, it is still vulnerable to:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Frequency analysis (common letters like 'E' and 'T' can be identified).</li>
                <li>Pattern recognition (common words like 'THE' and 'AND').</li>
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
              What type of cipher replaces each letter with another letter according to a fixed mapping?
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

export default SubstitutionCipherPage