import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Info, ArrowRight, RefreshCw, Check, X } from 'lucide-react'
import { encryptionService } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const VigenereCipherPage = () => {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('encrypt')
  const [plaintext, setPlaintext] = useState('HELLO WORLD')
  const [ciphertext, setCiphertext] = useState('')
  const [key, setKey] = useState('KEY')
  const [steps, setSteps] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showAllSteps, setShowAllSteps] = useState(false)
  const [quizAnswer, setQuizAnswer] = useState('')
  const [quizFeedback, setQuizFeedback] = useState(null)

  // Process encryption/decryption
  const processText = async () => {
    if (!key.match(/^[A-Za-z]+$/)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Key',
        description: 'The key must contain only letters.'
      })
      return
    }

    setIsLoading(true)
    try {
      if (activeTab === 'encrypt') {
        const result = await encryptionService.encrypt(plaintext, 'vigenere', key)
        setCiphertext(result.ciphertext)
        setSteps(result.steps)
      } else {
        const result = await encryptionService.decrypt(ciphertext, 'vigenere', key)
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
    const correctAnswer = 'VIGENERE'
    if (quizAnswer.toUpperCase() === correctAnswer) {
      setQuizFeedback({
        correct: true,
        message: 'Correct! The Vigenère cipher uses a keyword to determine variable shift values for each letter.'
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
        <h1 className="text-3xl font-bold mb-2">Vigenère Cipher</h1>
        <p className="text-muted-foreground mb-6">
          A polyalphabetic substitution cipher that uses a keyword to determine variable shift values.
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
                <Label htmlFor="key">Keyword</Label>
                <Input
                  id="key"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                  placeholder="Enter keyword (letters only)"
                />
                <p className="text-xs text-muted-foreground">
                  The keyword will be repeated to match the length of the plaintext.
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
                <Label htmlFor="key-decrypt">Keyword</Label>
                <Input
                  id="key-decrypt"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                  placeholder="Enter keyword (letters only)"
                />
                <p className="text-xs text-muted-foreground">
                  The keyword will be repeated to match the length of the ciphertext.
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
                            <div>Key char: {step.key_char}</div>
                            <div>Key shift: {step.key_shift}</div>
                            <div>Result: {step.result_char}</div>
                          </div>
                          
                          <div className="flex items-center justify-center mt-3 space-x-2">
                            <div className="character-box">{step.original_char}</div>
                            <div className="flex flex-col items-center">
                              <ArrowRight className="arrow-right" />
                              <span className="text-xs text-muted-foreground">
                                Shift {step.key_shift}
                              </span>
                            </div>
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
                                <span>Key character:</span>
                                <span className="font-mono">{steps[currentStep].key_char}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Key position:</span>
                                <span className="font-mono">{steps[currentStep].key_position}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Key shift value:</span>
                                <span className="font-mono">{steps[currentStep].key_shift}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Position in alphabet:</span>
                                <span className="font-mono">{steps[currentStep].position_in_alphabet}</span>
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
                                ? ` (position + key_shift) % 26 = new position`
                                : ` (position - key_shift + 26) % 26 = new position`}
                            </div>
                            
                            <div className="flex items-center justify-center space-x-4 mt-2">
                              <div className="character-box">{steps[currentStep].original_char}</div>
                              <div className="flex flex-col items-center">
                                <ArrowRight className="arrow-right" />
                                <span className="text-xs text-muted-foreground">
                                  Key: {steps[currentStep].key_char} ({steps[currentStep].key_shift})
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

        {/* Vigenère Table Visualization */}
        <motion.div
          className="step-container mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-4">Vigenère Table</h2>
          
          <div className="p-4 border rounded-md bg-muted/30 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border"></th>
                  {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map((char) => (
                    <th key={char} className="p-2 border font-mono">{char}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map((rowChar) => (
                  <tr key={rowChar}>
                    <th className="p-2 border font-mono">{rowChar}</th>
                    {Array.from({ length: 26 }, (_, j) => {
                      const charCode = ((i + j) % 26) + 65
                      return String.fromCharCode(charCode)
                    }).map((cellChar, index) => (
                      <td key={index} className="p-2 border text-center font-mono">
                        {cellChar}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm text-muted-foreground mt-4">
              To encrypt: Find the row with the key letter, then the column with the plaintext letter. 
              The intersection is the ciphertext letter.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              To decrypt: Find the row with the key letter, locate the ciphertext letter in that row, 
              and the column header is the plaintext letter.
            </p>
          </div>
        </motion.div>

        {/* Educational Section */}
        <motion.div
          className="step-container mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold mb-4">How Vigenère Cipher Works</h2>
          
          <div className="space-y-4">
            <p>
              The Vigenère cipher is a method of encrypting text by using a series of 
              interwoven Caesar ciphers, based on the letters of a keyword. It employs 
              a form of polyalphabetic substitution, making it more secure than simple 
              substitution ciphers.
            </p>
            
            <div className="p-4 border rounded-md bg-muted/30">
              <h3 className="font-medium mb-2 flex items-center">
                Encryption Process <Info className="info-tooltip ml-2" />
              </h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Choose a keyword (e.g., "KEY").</li>
                <li>Repeat the keyword to match the length of the plaintext.</li>
                <li>For each letter in the plaintext:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Convert the plaintext letter to its position in the alphabet (A=0, B=1, ..., Z=25).</li>
                    <li>Convert the corresponding keyword letter to its position (A=0, B=1, ..., Z=25).</li>
                    <li>Add the two positions together.</li>
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
                <li>Use the same keyword used for encryption.</li>
                <li>Repeat the keyword to match the length of the ciphertext.</li>
                <li>For each letter in the ciphertext:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Convert the ciphertext letter to its position in the alphabet.</li>
                    <li>Convert the corresponding keyword letter to its position.</li>
                    <li>Subtract the keyword position from the ciphertext position.</li>
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
                The Vigenère cipher is more secure than simple substitution ciphers because:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>It uses multiple Caesar ciphers, making frequency analysis more difficult.</li>
                <li>The same letter in the plaintext can be encrypted to different letters in the ciphertext.</li>
                <li>The longer the keyword, the more secure the encryption.</li>
              </ul>
              <p className="mt-2">
                However, it can still be broken using:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Kasiski examination (finding repeated patterns to determine the keyword length).</li>
                <li>Index of coincidence (statistical analysis to find the keyword length).</li>
                <li>Frequency analysis once the keyword length is known.</li>
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
              What cipher uses a keyword to determine variable shift values for each letter in the plaintext?
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

export default VigenereCipherPage