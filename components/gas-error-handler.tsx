'use client'

import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Zap, Settings, RefreshCw } from 'lucide-react'

interface GasErrorHandlerProps {
  error: Error | null
  onRetry: () => void
  onGasSettings?: () => void
}

export function GasErrorHandler({ error, onRetry, onGasSettings }: GasErrorHandlerProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  if (!error) return null

  const isGasError = error.message.includes('gas') || error.message.includes('intrinsic')
  const isInsufficientFunds = error.message.includes('insufficient funds')
  const isNetworkError = error.message.includes('network') || error.message.includes('connection')

  if (!isGasError && !isInsufficientFunds && !isNetworkError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Transaction Error</AlertTitle>
        <AlertDescription>
          {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="w-full border-destructive/20 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-destructive">
          <Zap className="h-5 w-5" />
          <span>Transaction Failed</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isGasError && (
          <div className="space-y-2">
            <Badge variant="destructive">Gas Error</Badge>
            <p className="text-sm text-muted-foreground">
              The transaction failed due to insufficient gas. This usually happens when:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Gas estimation failed (returned 0 gas)</li>
              <li>Network congestion requires higher gas</li>
              <li>Contract interaction is more complex than estimated</li>
            </ul>
          </div>
        )}

        {isInsufficientFunds && (
          <div className="space-y-2">
            <Badge variant="destructive">Insufficient Funds</Badge>
            <p className="text-sm text-muted-foreground">
              You don't have enough ETH to cover the transaction fees.
            </p>
          </div>
        )}

        {isNetworkError && (
          <div className="space-y-2">
            <Badge variant="destructive">Network Error</Badge>
            <p className="text-sm text-muted-foreground">
              There was a problem connecting to the network. Please check your connection.
            </p>
          </div>
        )}

        <div className="flex space-x-2">
          <Button 
            onClick={handleRetry} 
            disabled={isRetrying}
            variant="outline"
            size="sm"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Transaction
              </>
            )}
          </Button>
          
          {onGasSettings && (
            <Button 
              onClick={onGasSettings}
              variant="outline"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Gas Settings
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <p><strong>Error Details:</strong> {error.message}</p>
        </div>
      </CardContent>
    </Card>
  )
}
