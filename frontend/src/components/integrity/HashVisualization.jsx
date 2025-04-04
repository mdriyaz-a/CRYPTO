import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatBinary, formatHex } from '@/lib/utils'

const HashVisualization = ({ step }) => {
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
            {/* Input Preparation Step */}
            {step.step === 'Input Preparation' && (
              <>
                <div>
                  <Label className="text-sm">Original Message:</Label>
                  <div className="p-2 bg-muted rounded-md mt-1 overflow-x-auto">
                    <p className="font-mono text-sm">{step.message}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Message in Hexadecimal:</Label>
                  <div className="p-2 bg-muted rounded-md mt-1 overflow-x-auto">
                    <p className="font-mono text-sm">{formatHex(step.message_hex)}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Message in Binary:</Label>
                  <div className="p-2 bg-muted rounded-md mt-1 overflow-x-auto">
                    <p className="font-mono text-sm">{step.message_binary}</p>
                  </div>
                </div>
              </>
            )}

            {/* Padding Step */}
            {step.step === 'Padding' && (
              <>
                <div>
                  <Label className="text-sm">Padding Scheme:</Label>
                  <div className="p-2 bg-muted rounded-md mt-1">
                    <p className="font-mono text-sm">{step.padding_scheme}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Original Length:</Label>
                    <div className="p-2 bg-muted rounded-md mt-1">
                      <p className="font-mono text-sm">{step.original_length} bytes</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Padded Length:</Label>
                    <div className="p-2 bg-muted rounded-md mt-1">
                      <p className="font-mono text-sm">{step.padded_length} bytes</p>
                    </div>
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

            {/* Block Processing Step */}
            {step.step === 'Block Processing' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Number of Blocks:</Label>
                    <div className="p-2 bg-muted rounded-md mt-1">
                      <p className="font-mono text-sm">{step.num_blocks}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Block Size:</Label>
                    <div className="p-2 bg-muted rounded-md mt-1">
                      <p className="font-mono text-sm">{step.block_size} bytes</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Algorithm Details:</Label>
                  <div className="p-2 bg-muted rounded-md mt-1 space-y-2">
                    <p className="font-mono text-sm">
                      <span className="font-semibold">Name:</span> {step.algorithm_details.name}
                    </p>
                    <p className="font-mono text-sm">
                      <span className="font-semibold">Output Size:</span> {step.algorithm_details.output_size_bits} bits
                    </p>
                    <p className="font-mono text-sm">
                      <span className="font-semibold">Block Size:</span> {step.algorithm_details.block_size_bits} bits
                    </p>
                    <p className="font-mono text-sm">
                      <span className="font-semibold">Rounds:</span> {step.algorithm_details.rounds}
                    </p>
                    <p className="font-mono text-sm">
                      <span className="font-semibold">Operations:</span> {step.algorithm_details.operations}
                    </p>
                    <p className="font-mono text-sm">
                      <span className="font-semibold">Security Status:</span>{' '}
                      <span className={step.algorithm_details.security_status === 'Secure' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {step.algorithm_details.security_status}
                      </span>
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Final Hash Step */}
            {step.step === 'Final Hash' && (
              <>
                <div>
                  <Label className="text-sm">Hash Result (Hex):</Label>
                  <div className="p-2 bg-muted rounded-md mt-1 overflow-x-auto">
                    <p className="font-mono text-sm break-all">{step.hash_hex}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Hash in Binary:</Label>
                  <div className="p-2 bg-muted rounded-md mt-1 overflow-x-auto">
                    <p className="font-mono text-sm">{step.hash_binary}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Hash Length (Bytes):</Label>
                    <div className="p-2 bg-muted rounded-md mt-1">
                      <p className="font-mono text-sm">{step.hash_length_bytes} bytes</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Hash Length (Bits):</Label>
                    <div className="p-2 bg-muted rounded-md mt-1">
                      <p className="font-mono text-sm">{step.hash_length_bits} bits</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Visual Representation:</Label>
                  <div className="mt-1 h-8 rounded-md overflow-hidden flex">
                    {Array.from({ length: step.hash_bytes.length }).map((_, index) => (
                      <div
                        key={index}
                        className="h-full flex-1"
                        style={{
                          backgroundColor: `hsl(${(step.hash_bytes[index] / 255) * 360}, 80%, 60%)`
                        }}
                        title={`Byte ${index + 1}: ${step.hash_bytes[index]}`}
                      />
                    ))}
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
                    <Label className="text-sm">Original Hash:</Label>
                    <div className="p-2 bg-muted rounded-md mt-1 overflow-x-auto">
                      <p className="font-mono text-sm break-all">{step.original_hash}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Modified Hash:</Label>
                    <div className="p-2 bg-muted rounded-md mt-1 overflow-x-auto">
                      <p className="font-mono text-sm break-all">{step.modified_hash}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Bit Differences:</Label>
                  <div className="p-2 bg-muted rounded-md mt-1">
                    <p className="font-mono text-sm">
                      {step.bit_differences} out of {step.total_bits} bits ({step.difference_percentage}%)
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Visual Comparison:</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="h-8 rounded-md overflow-hidden flex">
                      {Array.from({ length: 16 }).map((_, index) => {
                        const color = `#${step.original_hash.substring(index * 2, index * 2 + 2).repeat(3).substring(0, 6)}`;
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
                        const color = `#${step.modified_hash.substring(index * 2, index * 2 + 2).repeat(3).substring(0, 6)}`;
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

export default HashVisualization