import { useState } from 'react'
import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { highlightDifferences, generateColorsFromHash } from '@/lib/utils'

const AvalancheEffect = ({ 
  originalMessage, 
  modifiedMessage, 
  originalHash, 
  modifiedHash,
  algorithm
}) => {
  const [showDetails, setShowDetails] = useState(false)
  
  // Calculate the percentage of different bits
  const calculateDifference = () => {
    let diffCount = 0
    for (let i = 0; i < originalHash.length; i++) {
      if (originalHash[i] !== modifiedHash[i]) {
        diffCount++
      }
    }
    return (diffCount / originalHash.length) * 100
  }
  
  const differencePercentage = calculateDifference()
  
  // Find the first character that differs between the messages
  const messageDifferences = highlightDifferences(originalMessage, modifiedMessage)
  const firstDiffIndex = messageDifferences.findIndex(diff => diff.isDifferent)
  
  // Generate colors for visualization
  const originalColors = generateColorsFromHash(originalHash, 16)
  const modifiedColors = generateColorsFromHash(modifiedHash, 16)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Avalanche Effect Demonstration</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center">
              <Label>Message Comparison</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-1 rounded-full bg-muted cursor-help">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Characters that differ between the original and modified messages are highlighted</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Original:</div>
                <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                  {messageDifferences.map((diff, index) => (
                    <span 
                      key={index}
                      className={diff.isDifferent ? 'bg-amber-200 dark:bg-amber-900/50 px-0.5 rounded' : ''}
                    >
                      {diff.original}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Modified:</div>
                <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                  {messageDifferences.map((diff, index) => (
                    <span 
                      key={index}
                      className={diff.isDifferent ? 'bg-amber-200 dark:bg-amber-900/50 px-0.5 rounded' : ''}
                    >
                      {diff.modified}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {firstDiffIndex !== -1 && (
              <div className="mt-2 text-sm text-muted-foreground">
                Changed character at position {firstDiffIndex + 1} from '{messageDifferences[firstDiffIndex].original}' to '{messageDifferences[firstDiffIndex].modified}'
              </div>
            )}
          </div>
          
          <div>
            <Label>Hash Comparison ({algorithm.toUpperCase()})</Label>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Original Hash:</div>
                <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                  {originalHash}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Modified Hash:</div>
                <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                  {modifiedHash}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <Label>Visual Representation</Label>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Original Hash:</div>
                <div className="h-8 rounded-md overflow-hidden flex">
                  {originalColors.map((color, index) => (
                    <div 
                      key={index} 
                      className="h-full flex-1" 
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Modified Hash:</div>
                <div className="h-8 rounded-md overflow-hidden flex">
                  {modifiedColors.map((color, index) => (
                    <div 
                      key={index} 
                      className="h-full flex-1" 
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <Label>Difference Analysis</Label>
            <div className="mt-2 p-4 bg-muted rounded-md">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold mb-2">
                  {differencePercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  of the hash output bits are different, despite only a tiny change in the input.
                </div>
                
                <div className="w-full mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${differencePercentage}%` }}
                  ></div>
                </div>
                
                <div className="mt-4 text-sm">
                  <span className="font-medium">Ideal difference:</span> 50% (for a secure hash function)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 border border-muted-foreground/20 rounded-md">
        <h4 className="font-medium mb-2">What is the Avalanche Effect?</h4>
        <p className="text-sm text-muted-foreground">
          The avalanche effect is a desirable property of cryptographic hash functions where a small change in the input (even a single bit) 
          results in a significant change in the output hash (approximately 50% of the bits). This property is crucial for security, as it 
          ensures that even tiny modifications to a message produce completely different hash values, making it difficult to predict how 
          changes in the input will affect the output.
        </p>
      </div>
    </div>
  )
}

export default AvalancheEffect