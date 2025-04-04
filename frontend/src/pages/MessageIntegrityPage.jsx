import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import HashTab from '@/components/integrity/HashTab'
import MACTab from '@/components/integrity/MACTab'
import IntegrityQuizTab from '@/components/integrity/IntegrityQuizTab'

const MessageIntegrityPage = () => {
  const [activeTab, setActiveTab] = useState('hash')

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Message Integrity</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Learn about cryptographic hash functions and message authentication codes (MACs)
            through interactive visualizations and step-by-step explanations.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hash">Hash Functions</TabsTrigger>
            <TabsTrigger value="mac">MAC & HMAC</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hash">
            <HashTab />
          </TabsContent>
          
          <TabsContent value="mac">
            <MACTab />
          </TabsContent>
          
          <TabsContent value="quiz">
            <IntegrityQuizTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

export default MessageIntegrityPage