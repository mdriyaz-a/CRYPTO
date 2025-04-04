import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Lock, Shield, Key, RefreshCw, FileDigit, Hash } from 'lucide-react'

const HomePage = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const classicalCiphers = [
    {
      name: 'Caesar Cipher',
      description: 'A simple substitution cipher where each letter is shifted by a fixed number of positions.',
      path: '/classical/caesar',
      icon: <RefreshCw className="h-10 w-10 mb-4 text-blue-500" />
    },
    {
      name: 'Substitution Cipher',
      description: 'A method where each letter is replaced with another letter according to a fixed mapping.',
      path: '/classical/substitution',
      icon: <Key className="h-10 w-10 mb-4 text-green-500" />
    },
    {
      name: 'Vigenère Cipher',
      description: 'A polyalphabetic substitution cipher that uses a keyword to determine the shift value.',
      path: '/classical/vigenere',
      icon: <Lock className="h-10 w-10 mb-4 text-purple-500" />
    }
  ]

  const modernCiphers = [
    {
      name: 'AES Encryption',
      description: 'Advanced Encryption Standard with ECB, CBC, and CTR modes of operation.',
      path: '/modern/aes',
      icon: <Shield className="h-10 w-10 mb-4 text-red-500" />
    },
    {
      name: 'Triple DES',
      description: 'A symmetric-key block cipher that applies the DES cipher algorithm three times.',
      path: '/modern/3des',
      icon: <Lock className="h-10 w-10 mb-4 text-yellow-500" />
    }
  ]

  const integrityModules = [
    {
      name: 'Hash Functions',
      description: 'Learn about cryptographic hash functions like SHA-256 and their role in ensuring data integrity.',
      path: '/integrity',
      icon: <Hash className="h-10 w-10 mb-4 text-blue-600" />
    },
    {
      name: 'MAC & HMAC',
      description: 'Explore message authentication codes that provide both integrity and authenticity verification.',
      path: '/integrity',
      icon: <FileDigit className="h-10 w-10 mb-4 text-green-600" />
    }
  ]

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <motion.section
        className="text-center py-12 md:py-20"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-6"
          variants={fadeIn}
        >
          Learn Cryptography <span className="text-primary">Interactively</span>
        </motion.h1>
        
        <motion.p
          className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
          variants={fadeIn}
        >
          Explore classical and modern encryption methods through visual demonstrations
          and step-by-step explanations.
        </motion.p>
        
        <motion.div
          className="flex flex-wrap justify-center gap-4"
          variants={fadeIn}
        >
          <Link
            to="/classical"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Classical Ciphers
          </Link>
          <Link
            to="/modern"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Modern Encryption
          </Link>
          <Link
            to="/integrity"
            className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Message Integrity
          </Link>
        </motion.div>
      </motion.section>

      {/* Classical Ciphers Section */}
      <motion.section
        className="py-12 border-t"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-3xl font-bold mb-8 text-center">Classical Ciphers</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {classicalCiphers.map((cipher, index) => (
            <motion.div
              key={cipher.name}
              className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <div className="flex flex-col items-center text-center">
                {cipher.icon}
                <h3 className="text-xl font-semibold mb-2">{cipher.name}</h3>
                <p className="text-muted-foreground mb-4">{cipher.description}</p>
                <Link
                  to={cipher.path}
                  className="inline-flex items-center text-primary hover:underline"
                >
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Modern Ciphers Section */}
      <motion.section
        className="py-12 border-t"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-8 text-center">Modern Encryption</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {modernCiphers.map((cipher, index) => (
            <motion.div
              key={cipher.name}
              className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <div className="flex flex-col items-center text-center">
                {cipher.icon}
                <h3 className="text-xl font-semibold mb-2">{cipher.name}</h3>
                <p className="text-muted-foreground mb-4">{cipher.description}</p>
                <Link
                  to={cipher.path}
                  className="inline-flex items-center text-primary hover:underline"
                >
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="py-12 border-t"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <h2 className="text-3xl font-bold mb-8 text-center">Platform Features</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-3">Interactive Visualizations</h3>
            <p className="text-muted-foreground">
              See encryption algorithms in action with step-by-step visual demonstrations.
            </p>
          </div>
          
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-3">Real-time Encryption</h3>
            <p className="text-muted-foreground">
              Encrypt and decrypt messages in real-time with adjustable parameters.
            </p>
          </div>
          
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-3">Educational Content</h3>
            <p className="text-muted-foreground">
              Learn the theory behind each algorithm with detailed explanations and quizzes.
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  )
}

export default HomePage