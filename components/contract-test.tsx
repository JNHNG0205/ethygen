'use client'

import { useContracts } from '@/providers/contracts-provider'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatEther } from 'viem'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { NetworkSwitch } from './network-switch'
import { isChainSupported } from '@/lib/contracts'

export function ContractTest() {
  const { chain } = useAccount()
  const { usde, yieldEngine, yusde, vault, perpdex, isLoading, hasError, error } = useContracts()
  
  const isSupported = chain ? isChainSupported(chain.id) : false

  const testResults = [
    {
      name: 'USDe Contract',
      status: usde.balance !== undefined ? 'connected' : 'loading',
      data: usde.balance ? formatEther(usde.balance as bigint) : '0.00',
      unit: 'USDe'
    },
    {
      name: 'Yield Engine',
      status: yieldEngine.sUSDeBalance !== undefined ? 'connected' : 'loading',
      data: yieldEngine.sUSDeBalance ? formatEther(yieldEngine.sUSDeBalance as bigint) : '0.00',
      unit: 'sUSDe'
    },
    {
      name: 'YUSDe Contract',
      status: yusde.yUSDeBalance !== undefined ? 'connected' : 'loading',
      data: yusde.yUSDeBalance ? formatEther(yusde.yUSDeBalance as bigint) : '0.00',
      unit: 'yUSDe'
    },
    {
      name: 'Vault Contract',
      status: vault.userBalance !== undefined ? 'connected' : 'loading',
      data: vault.userBalance ? formatEther(vault.userBalance as bigint) : '0.00',
      unit: 'USDe'
    },
    {
      name: 'PerpDEX',
      status: perpdex.hasPosition !== undefined ? 'connected' : 'loading',
      data: perpdex.hasPosition ? 'Active Position' : 'No Position',
      unit: ''
    }
  ]

  // Show network switch if chain is not supported
  if (!isSupported) {
    return <NetworkSwitch />
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5" />
          <span>Contract Integration Test</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="font-medium">Overall Status</span>
          <Badge variant={hasError ? "destructive" : "default"}>
            {hasError ? "Error" : "Connected"}
          </Badge>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="text-sm font-medium text-destructive">Error:</div>
            <div className="text-sm text-destructive">{error.message}</div>
          </div>
        )}

        {/* Individual Contract Tests */}
        <div className="space-y-2">
          {testResults.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
              <div className="flex items-center space-x-2">
                {test.status === 'connected' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : test.status === 'loading' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="font-medium">{test.name}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono">{test.data}</div>
                {test.unit && <div className="text-xs text-muted-foreground">{test.unit}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Contract Addresses */}
        <div className="pt-4 border-t">
          <div className="text-sm font-medium mb-2">Contract Addresses (Sepolia)</div>
          <div className="space-y-1 text-xs font-mono text-muted-foreground">
            <div>USDe: 0x5e034a923D3947A2fE04172EA9cB3D35EA1f2abA</div>
            <div>YieldEngine: 0x5E63123AB3970e4A25a17103A8552C4555f3C4B8</div>
            <div>YUSDe: 0x21c4cE8cAEE307a47E1EC35De871b02580e6E6cE</div>
            <div>Vault: 0xC8298b7abC7a9298936d3Fe0CE71c2e10919C203</div>
            <div>PerpDEX: 0x2a0fADd0e2e918A5238991AD759c5a09F9A10942</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="pt-4 border-t">
          <div className="text-sm font-medium mb-2">Integration Status</div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>✅ Contract addresses configured</div>
            <div>✅ ABIs integrated</div>
            <div>✅ Hooks created</div>
            <div>✅ Provider setup</div>
            <div>✅ UI components created</div>
            <div>✅ Error handling implemented</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
