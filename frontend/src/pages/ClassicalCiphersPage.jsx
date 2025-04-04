import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, RefreshCw, Key, Lock } from 'lucide-react'

const ClassicalCiphersPage = () => {
  const ciphers = [
    {
      id: 'caesar',
      name: 'Caesar Cipher',
      description: 'A substitution cipher where each letter is shifted by a fixed number of positions in the alphabet.',
      icon: <RefreshCw className="h-12 w-12 mb-4 text-blue-500" />,
      features: [
        'Simple shift-based encryption',
        'Named after Julius Caesar',
        'Easy to break with frequency analysis',
        'Historical significance in cryptography'
      ],
      path: '/classical/caesar'
    },
    {
      id: 'substitution',
      name: 'Substitution Cipher',
      description: 'A method where each letter is replaced with another letter according to a fixed mapping.',
      icon: <Key className="h-12 w-12 mb-4 text-green-500" />,
      features: [
        'One-to-one mapping of letters',
        'Stronger than Caesar cipher',
        'Can be broken with frequency analysis',
        '26! possible keys (too many to brute force)'
      ],
      path: '/classical/substitution'
    },
    {
      id: 'vigenere',
      name: 'Vigenère Cipher',
      description: 'A polyalphabetic substitution cipher that uses a keyword to determine variable shift values.',
      icon: <Lock className="h-12 w-12 mb-4 text-purple-500" />,
      features: [
        'Uses a keyword for shifting',
        'Multiple Caesar ciphers in sequence',
        'Resistant to simple frequency analysis',
        'Developed in the 16th century'
      ],
      path: '/classical/vigenere'
    }
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-4">Classical Ciphers</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Explore the foundational encryption methods that laid the groundwork for modern cryptography.
        </p>
      </motion.div>

      <div className="space-y-12 mb-12">
        {ciphers.map((cipher, index) => (
          <motion.div
            key={cipher.id}
            className="border rounded-lg overflow-hidden bg-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
          >
            <div className="md:flex">
              <div className="md:w-1/3 p-8 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r">
                {cipher.icon}
                <h2 className="text-2xl font-bold mb-2">{cipher.name}</h2>
                <p className="text-muted-foreground">{cipher.description}</p>
              </div>
              
              <div className="md:w-2/3 p-8">
                <h3 className="text-lg font-semibold mb-4">Key Features</h3>
                <ul className="space-y-2 mb-6">
                  {cipher.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2 text-primary">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  to={cipher.path}
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                >
                  Explore {cipher.name} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="border-t pt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4">Historical Context</h2>
        <p className="text-muted-foreground mb-4">
          Classical ciphers were the primary means of secure communication for thousands of years, 
          from ancient civilizations through World War II. While they've been replaced by more 
          sophisticated algorithms in modern applications, understanding these fundamental 
          techniques provides valuable insights into the evolution of cryptography.
        </p>
        <p className="text-muted-foreground">
          These ciphers also demonstrate important cryptographic principles like confusion and 
          diffusion, which remain relevant in modern encryption systems.
        </p>
      </motion.div>
    </div>
  )
}

export default ClassicalCiphersPage