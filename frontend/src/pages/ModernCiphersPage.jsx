import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Lock, Layers } from 'lucide-react'

const ModernCiphersPage = () => {
  const ciphers = [
    {
      id: 'aes',
      name: 'Advanced Encryption Standard (AES)',
      description: 'A symmetric block cipher adopted as an encryption standard by the U.S. government.',
      icon: <Shield className="h-12 w-12 mb-4 text-red-500" />,
      features: [
        'Block sizes of 128 bits',
        'Key sizes of 128, 192, or 256 bits',
        'Multiple modes of operation (ECB, CBC, CTR)',
        'Widely used in secure communications'
      ],
      modes: [
        { name: 'ECB (Electronic Codebook)', desc: 'Each block is encrypted independently' },
        { name: 'CBC (Cipher Block Chaining)', desc: 'Each block is XORed with the previous ciphertext block' },
        { name: 'CTR (Counter)', desc: 'Converts a block cipher into a stream cipher using a counter' }
      ],
      path: '/modern/aes'
    },
    {
      id: '3des',
      name: 'Triple DES (3DES)',
      description: 'A symmetric-key block cipher that applies the DES cipher algorithm three times to each data block.',
      icon: <Layers className="h-12 w-12 mb-4 text-yellow-500" />,
      features: [
        'Uses three 56-bit keys (168 bits total)',
        'More secure than original DES',
        'Slower than AES but still used in legacy systems',
        'Encrypt-Decrypt-Encrypt (EDE) process'
      ],
      path: '/modern/3des'
    }
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-4">Modern Encryption</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Explore contemporary encryption algorithms that secure our digital communications today.
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
            <div className="p-8 border-b">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="flex-shrink-0 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                  {cipher.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">{cipher.name}</h2>
                  <p className="text-muted-foreground">{cipher.description}</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <h3 className="text-lg font-semibold mb-4">Key Features</h3>
              <ul className="space-y-2 mb-6">
                {cipher.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {cipher.modes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Modes of Operation</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {cipher.modes.map((mode, i) => (
                      <div key={i} className="border rounded-md p-4 bg-muted/30">
                        <h4 className="font-medium mb-2">{mode.name}</h4>
                        <p className="text-sm text-muted-foreground">{mode.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Link
                to={cipher.path}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                Explore {cipher.name} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
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
        <h2 className="text-2xl font-bold mb-4">Modern Cryptography</h2>
        <p className="text-muted-foreground mb-4">
          Modern encryption algorithms are designed to be computationally secure, meaning they 
          cannot be broken with current computing technology in a reasonable amount of time. 
          These algorithms form the backbone of secure communications across the internet, 
          protecting everything from financial transactions to private messages.
        </p>
        <p className="text-muted-foreground">
          Unlike classical ciphers, modern encryption uses complex mathematical operations 
          and is typically implemented in combination with secure protocols to provide 
          confidentiality, integrity, and authenticity.
        </p>
      </motion.div>
    </div>
  )
}

export default ModernCiphersPage