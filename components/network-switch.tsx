'use client'

import { useAccount, useSwitchChain } from 'wagmi'
import { sepolia } from 'viem/chains'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { isChainSupported } from '@/lib/contracts'
import { AlertTriangle, ExternalLink } from 'lucide-react'

export function NetworkSwitch() {
  const { chain } = useAccount()
  const { switchChain } = useSwitchChain()

  const isSupported = chain ? isChainSupported(chain.id) : false

  if (isSupported) {
    return null // Don't show if chain is supported
  }

  const handleSwitchToSepolia = () => {
    switchChain({ chainId: sepolia.id })
  }

  return (
    <Card className="w-full border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-800 dark:text-orange-200">
          <AlertTriangle className="h-5 w-5" />
          <span>Switch to Sepolia Testnet</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            The Ethygen contracts are only deployed on Sepolia testnet. 
            Please switch your network to continue.
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm font-medium">Current Network</div>
            <Badge variant="destructive">
              {chain?.name || 'Unknown Network'}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">Required Network</div>
            <Badge variant="default">
              Sepolia Testnet
            </Badge>
          </div>
        </div>

        <Button 
          onClick={handleSwitchToSepolia}
          className="w-full"
          variant="default"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Switch to Sepolia
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <div>• Get Sepolia ETH from: <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Sepolia Faucet</a></div>
          <div>• Contract addresses are configured for Sepolia testnet</div>
          <div>• All transactions will be on testnet (no real funds)</div>
        </div>
      </CardContent>
    </Card>
  )
}
