import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Lock } from 'lucide-react'

const NotFoundPage = () => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Lock className="h-20 w-20 text-muted-foreground mb-6" />
      
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        The page you're looking for has been encrypted and we don't have the key to decrypt it.
      </p>
      
      <Link 
        to="/" 
        className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        <Home className="mr-2 h-4 w-4" /> Return Home
      </Link>
    </motion.div>
  )
}

export default NotFoundPage