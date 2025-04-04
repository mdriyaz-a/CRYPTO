import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, ArrowRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

const IntegrityQuizTab = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Quiz questions
  const questions = [
    {
      question: "What is the primary purpose of a cryptographic hash function?",
      options: [
        "To encrypt data for secure transmission",
        "To generate a fixed-size output from variable-size input data",
        "To decrypt encrypted messages",
        "To store passwords in plaintext"
      ],
      correctAnswer: 1,
      explanation: "Cryptographic hash functions generate a fixed-size output (hash) from variable-size input data. They are one-way functions designed to be computationally infeasible to reverse."
    },
    {
      question: "Which of the following is NOT a property of a secure cryptographic hash function?",
      options: [
        "Pre-image resistance",
        "Collision resistance",
        "Avalanche effect",
        "Reversibility"
      ],
      correctAnswer: 3,
      explanation: "Secure hash functions should NOT be reversible. They are one-way functions, meaning it should be computationally infeasible to determine the input from the hash output."
    },
    {
      question: "What is the 'avalanche effect' in hash functions?",
      options: [
        "The tendency of hash functions to produce longer outputs over time",
        "A small change in the input causes a significant change in the output",
        "The ability to reverse a hash with enough computational power",
        "The process of combining multiple hash functions together"
      ],
      correctAnswer: 1,
      explanation: "The avalanche effect refers to the property where a small change in the input (even a single bit) results in a significant change in the hash output, typically changing about half of the output bits."
    },
    {
      question: "What does HMAC stand for?",
      options: [
        "Hash-based Message Authentication Code",
        "Hashed Method for Authentication and Cryptography",
        "Highly Managed Access Control",
        "Hexadecimal Message Authentication Cipher"
      ],
      correctAnswer: 0,
      explanation: "HMAC stands for Hash-based Message Authentication Code. It's a specific type of message authentication code (MAC) that involves a cryptographic hash function and a secret key."
    },
    {
      question: "Why is HMAC more secure than using a plain hash for message authentication?",
      options: [
        "HMAC is always faster than plain hashing",
        "HMAC uses multiple hash functions simultaneously",
        "HMAC incorporates a secret key that only the sender and receiver know",
        "HMAC produces longer hash outputs"
      ],
      correctAnswer: 2,
      explanation: "HMAC incorporates a secret key that only the sender and receiver know. This provides authentication (proof of who sent the message) in addition to integrity verification."
    },
    {
      question: "Which of the following hash algorithms is considered cryptographically broken and should NOT be used for security-critical applications?",
      options: [
        "SHA-256",
        "SHA-3",
        "MD5",
        "BLAKE2"
      ],
      correctAnswer: 2,
      explanation: "MD5 is considered cryptographically broken as researchers have demonstrated collision attacks. It should not be used for security-critical applications."
    },
    {
      question: "What happens if you change a single bit in the input to a hash function?",
      options: [
        "The hash output remains the same",
        "The hash output changes slightly",
        "The hash output changes significantly (approximately 50% of the bits)",
        "The hash function fails and returns an error"
      ],
      correctAnswer: 2,
      explanation: "Due to the avalanche effect, changing even a single bit in the input will cause approximately 50% of the bits in the hash output to change, resulting in a completely different hash."
    },
    {
      question: "In the HMAC construction, what are 'ipad' and 'opad'?",
      options: [
        "Input and output padding algorithms",
        "Inner and outer padding constants (0x36 and 0x5C)",
        "Initial and optimal padding sequences",
        "Integrity and optimization parameters"
      ],
      correctAnswer: 1,
      explanation: "In HMAC, 'ipad' and 'opad' are the inner and outer padding constants, which are 0x36 and 0x5C repeated to fill a block. They are XORed with the key as part of the HMAC computation."
    },
    {
      question: "What is a 'collision' in the context of hash functions?",
      options: [
        "When a hash function produces an error during computation",
        "When two different inputs produce the same hash output",
        "When the same input produces different hash outputs",
        "When a hash function takes too long to compute"
      ],
      correctAnswer: 1,
      explanation: "A collision occurs when two different inputs produce the same hash output. Secure hash functions should be collision-resistant, meaning it should be computationally infeasible to find such collisions."
    },
    {
      question: "Which of the following is a common application of message authentication codes (MACs)?",
      options: [
        "Encrypting sensitive data",
        "Generating random numbers",
        "Verifying the integrity and authenticity of messages",
        "Compressing large files"
      ],
      correctAnswer: 2,
      explanation: "Message Authentication Codes (MACs) are primarily used to verify both the integrity (the message hasn't been altered) and authenticity (the message comes from the claimed sender) of messages."
    }
  ]

  // Check the selected answer
  const checkAnswer = () => {
    if (selectedAnswer === null) return
    
    setIsLoading(true)
    
    // Simulate API call delay
    setTimeout(() => {
      setIsAnswered(true)
      
      if (selectedAnswer === questions[currentQuestion].correctAnswer) {
        setScore(score + 1)
      }
      
      setIsLoading(false)
    }, 500)
  }

  // Move to the next question
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
    } else {
      setQuizCompleted(true)
    }
  }

  // Restart the quiz
  const restartQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setScore(0)
    setQuizCompleted(false)
  }

  // Calculate progress percentage
  const progressPercentage = ((currentQuestion + (isAnswered ? 1 : 0)) / questions.length) * 100

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {!quizCompleted ? (
          <Card className="max-w-3xl mx-auto">
            <CardContent className="pt-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <span className="text-sm font-medium">
                    Score: {score}/{currentQuestion + (isAnswered ? 1 : 0)}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              
              <h2 className="text-xl font-semibold mb-4">
                {questions[currentQuestion].question}
              </h2>
              
              <RadioGroup
                value={selectedAnswer !== null ? selectedAnswer.toString() : undefined}
                onValueChange={(value) => setSelectedAnswer(parseInt(value))}
                className="space-y-3"
                disabled={isAnswered}
              >
                {questions[currentQuestion].options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-2 p-3 rounded-md border ${
                      isAnswered
                        ? index === questions[currentQuestion].correctAnswer
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : selectedAnswer === index
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-transparent'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <RadioGroupItem
                      value={index.toString()}
                      id={`option-${index}`}
                      className={
                        isAnswered && index === questions[currentQuestion].correctAnswer
                          ? 'text-green-500 border-green-500'
                          : isAnswered && selectedAnswer === index
                          ? 'text-red-500 border-red-500'
                          : ''
                      }
                    />
                    <Label
                      htmlFor={`option-${index}`}
                      className={`flex-1 ${
                        isAnswered && index === questions[currentQuestion].correctAnswer
                          ? 'text-green-700 dark:text-green-300'
                          : isAnswered && selectedAnswer === index
                          ? 'text-red-700 dark:text-red-300'
                          : ''
                      }`}
                    >
                      {option}
                    </Label>
                    {isAnswered && index === questions[currentQuestion].correctAnswer && (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                    {isAnswered && selectedAnswer === index && selectedAnswer !== questions[currentQuestion].correctAnswer && (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                ))}
              </RadioGroup>
              
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-muted rounded-md"
                >
                  <h3 className="font-medium mb-1">Explanation:</h3>
                  <p>{questions[currentQuestion].explanation}</p>
                </motion.div>
              )}
              
              <div className="mt-6 flex justify-end">
                {!isAnswered ? (
                  <Button
                    onClick={checkAnswer}
                    disabled={selectedAnswer === null || isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Check Answer
                  </Button>
                ) : (
                  <Button onClick={nextQuestion}>
                    {currentQuestion < questions.length - 1 ? (
                      <>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Next Question
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Complete Quiz
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-3xl mx-auto">
            <CardContent className="pt-6">
              <div className="text-center py-6">
                <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
                <p className="text-muted-foreground mb-6">
                  You scored {score} out of {questions.length}
                </p>
                
                <div className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center bg-primary/10">
                  <span className="text-4xl font-bold">
                    {Math.round((score / questions.length) * 100)}%
                  </span>
                </div>
                
                <div className="mb-6">
                  {score === questions.length ? (
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      Perfect score! You have an excellent understanding of message integrity concepts.
                    </p>
                  ) : score >= questions.length * 0.8 ? (
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      Great job! You have a strong understanding of message integrity concepts.
                    </p>
                  ) : score >= questions.length * 0.6 ? (
                    <p className="text-amber-600 dark:text-amber-400 font-medium">
                      Good effort! You understand the basics of message integrity, but there's room for improvement.
                    </p>
                  ) : (
                    <p className="text-red-600 dark:text-red-400 font-medium">
                      You might want to review the message integrity concepts again to strengthen your understanding.
                    </p>
                  )}
                </div>
                
                <Button onClick={restartQuiz}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Restart Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Additional Resources */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold">Additional Resources</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-3">Hash Functions</h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="https://en.wikipedia.org/wiki/Cryptographic_hash_function" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Cryptographic Hash Functions (Wikipedia)
                  </a>
                </li>
                <li>
                  <a 
                    href="https://csrc.nist.gov/projects/hash-functions" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    NIST Hash Function Standards
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.youtube.com/watch?v=b4b8ktEV4Bg" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    How SHA-256 Works Step-By-Step (Video)
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-3">MAC & HMAC</h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="https://en.wikipedia.org/wiki/HMAC" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    HMAC (Wikipedia)
                  </a>
                </li>
                <li>
                  <a 
                    href="https://tools.ietf.org/html/rfc2104" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    RFC 2104: HMAC Specification
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.youtube.com/watch?v=0628oUIssFA" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Message Authentication Codes (Video)
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

export default IntegrityQuizTab