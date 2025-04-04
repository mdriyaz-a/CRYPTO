import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatHex } from '@/lib/utils'

const HMACVisualization = ({ step }) => {
  if (!step) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{step.step}</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-1 rounded-full bg-muted cursor-help">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{step.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-4">
            {/* Key Preparation Step */}
            {step.step === 'Key Preparation' && (
              <>
                <div>
                  <Label className="text-sm">Original Key:</Label>
                  <div className="p-2 bg-muted rounded-md mt-1 overflow-x-auto">
                    <p className="font-mono text-sm">{step.original_key}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Key in Hexadecimal:</Label>
                  <div className="p-2 bg-muted rounded-md mt-1 overflow-x-auto">
                    <p className="font-mono text-sm">{formatHex(step.key_hex)}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Processed Key:</Label>
                  <div className="p-2 bg-muted rounded-md mt-1 overflow-x-auto">
                    <p className="font-mono text-sm">{formatHex(step.processed_key_hex)}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Key Processing:</Label>
                  <div className="p-2 bg-muted rounded-md mt-1">
                    <p className="font-mono text-sm">{step.key_preparation}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Block Size:</Label>
                  <div className="p-2 bg-muted rounded-md mt-1">
                    <p className="font-mono text-sm">{step.block_size} bytes</p>
                  </div>
                </div>
              </>
            )}

            {/* Inner Padding Step */}
            {step.step === 'Inner Padding' && (
              <>
                <div>
                  <Label className="text-sm">Inner Pad (ipad):</Label>
                  <div className="p-2 bg-muted rounded-md mt-1 overflow-x-auto">
                    <p className="font-mono text-sm">{formatHex(step.inner_pad_hex)}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Operation:</Label>
                  <div className="p-2 bg-muted rounded-md mt-1">
                    <p className="font-mono text-sm">{step.operation}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Visual Representation:</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-24 text-right text-sm">Key:</div>
                      <div className="flex-1 h-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center font-mono text-sm">
                        Processed Key
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-24 text-right text-sm">XOR with:</div>
                      <div className="flex-1 h-8 bg-amber-100 dark:bg-amber-900/30 rounded flex items-center justify-center font-mono text-sm">
                        0x36 repeated
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 text-right text-sm">Result:</div>
                      <div className="flex-1 h-8 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center font-mono text-sm">
                        Inner Pad
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Outer Padding Step */}
            {step.step === 'Outer Padding' && (
              <>
                <div>
                  <Label className="text-sm">Outer Pad (opad):</Label>
                  <div className="p-2 bg-muted rounded-md mt-1 overflow-x-auto">
                    <p className="font-mono text-sm">{formatHex(step.outer_pad_hex)}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Operation:</Label>
                  <div className="p-2 bg-muted rounded-md mt-1">
                    <p className="font-mono text-sm">{step.operation}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Visual Representation:</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-24 text-right text-sm">Key:</div>
                      <div className="flex-1 h-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center font-mono text-sm">
                        Processed Key
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-24 text-right text-sm">XOR with:</div>
                      <div className="flex-1 h-8 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center font-mono text-sm">
                        0x5C repeated
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 text-right text-sm">Result:</div>
                      <div className="flex-1 h-8 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center font-mono text-sm">
                        Outer Pad
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Inner Hash Step */}
            {step.step === 'Inner Hash' && (
              <>
                <div>
                  <Label className="text-sm">Inner Hash Input:</Label>
                  <div className="p-2 bg-muted rounded-md mt-1 overflow-x-auto">
                    <p className="font-mono text-sm">{formatHex(step.inner_hash_input_hex)}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Inner Hash Result:</Label>
                  <div className="p-2 bg-muted rounded-md mt-1 overflow-x-auto">
                    <p className="font-mono text-sm">{formatHex(step.inner_hash_hex)}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Operation:</Label>
                  <div className="p-2 bg-muted rounded-md mt-1">
                    <p className="font-mono text-sm">{step.operation}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Visual Representation:</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-24 text-right text-sm">Input:</div>
                      <div className="flex-1">
                        <div className="flex h-8">
                          <div className="w-1/2 bg-green-100 dark:bg-green-900/30 rounded-l flex items-center justify-center font-mono text-sm">
                            Inner Pad
                          </div>
                          <div className="w-1/2 bg-blue-100 dark:bg-blue-900/30 rounded-r flex items-center justify-center font-mono text-sm">
                            Message
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 text-right text-sm">Result:</div>
                      <div className="flex-1 h-8 bg-amber-100 dark:bg-amber-900/30 rounded flex items-center justify-center font-mono text-sm">
                        Inner Hash
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Outer Hash Step */}
            {step.step === 'Outer Hash (Final HMAC)' && (
              <>
                <div>
                  <Label className="text-sm">Outer Hash Input:</Label>
                  <div className="p-2 bg-muted rounded-md mt-1 overflow-x-auto">
                    <p className="font-mono text-sm">{formatHex(step.outer_hash_input_hex)}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Final HMAC:</Label>
                  <div className="p-2 bg-muted rounded-md mt-1 overflow-x-auto">
                    <p className="font-mono text-sm break-all">{step.hmac_hex}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Operation:</Label>
                  <div className="p-2 bg-muted rounded-md mt-1">
                    <p className="font-mono text-sm">{step.operation}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Visual Representation:</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-24 text-right text-sm">Input:</div>
                      <div className="flex-1">
                        <div className="flex h-8">
                          <div className="w-1/2 bg-green-100 dark:bg-green-900/30 rounded-l flex items-center justify-center font-mono text-sm">
                            Outer Pad
                          </div>
                          <div className="w-1/2 bg-amber-100 dark:bg-amber-900/30 rounded-r flex items-center justify-center font-mono text-sm">
                            Inner Hash
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 text-right text-sm">Result:</div>
                      <div className="flex-1 h-8 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center font-mono text-sm">
                        Final HMAC
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Visual Representation of HMAC:</Label>
                  <div className="mt-1 h-8 rounded-md overflow-hidden flex">
                    {Array.from({ length: 16 }).map((_, index) => {
                      const color = `#${step.hmac_hex.substring(index * 2, index * 2 + 2).repeat(3).substring(0, 6)}`;
                      return (
                        <div
                          key={index}
                          className="h-full flex-1"
                          style={{ backgroundColor: color }}
                        />
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Avalanche Effect Step */}
            {step.step === 'Avalanche Effect' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Original Message:</Label>
                    <div className="p-2 bg-muted rounded-md mt-1 overflow-x-auto">
                      <p className="font-mono text-sm">{step.original_message}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Modified Message:</Label>
                    <div className="p-2 bg-muted rounded-md mt-1 overflow-x-auto">
                      <p className="font-mono text-sm">{step.modified_message}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Change Made:</Label>
                  <div className="p-2 bg-muted rounded-md mt-1">
                    <p className="font-mono text-sm">{step.change_description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Original HMAC:</Label>
                    <div className="p-2 bg-muted rounded-md mt-1 overflow-x-auto">
                      <p className="font-mono text-sm break-all">{step.original_hmac}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Modified HMAC:</Label>
                    <div className="p-2 bg-muted rounded-md mt-1 overflow-x-auto">
                      <p className="font-mono text-sm break-all">{step.modified_hmac}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Visual Comparison:</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="h-8 rounded-md overflow-hidden flex">
                      {Array.from({ length: 16 }).map((_, index) => {
                        const color = `#${step.original_hmac.substring(index * 2, index * 2 + 2).repeat(3).substring(0, 6)}`;
                        return (
                          <div
                            key={index}
                            className="h-full flex-1"
                            style={{ backgroundColor: color }}
                          />
                        );
                      })}
                    </div>
                    <div className="h-8 rounded-md overflow-hidden flex">
                      {Array.from({ length: 16 }).map((_, index) => {
                        const color = `#${step.modified_hmac.substring(index * 2, index * 2 + 2).repeat(3).substring(0, 6)}`;
                        return (
                          <div
                            key={index}
                            className="h-full flex-1"
                            style={{ backgroundColor: color }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default HMACVisualization