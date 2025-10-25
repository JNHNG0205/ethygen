'use client'

import { useState } from 'react'
import { useContracts } from '@/providers/contracts-provider'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatEther, parseEther } from 'viem'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, XCircle, Loader2, TestTube, Zap, Coins, TrendingUp } from 'lucide-react'
import { NetworkSwitch } from './network-switch'
import { isChainSupported } from '@/lib/contracts'

export function EnhancedContractTest() {
  const { chain } = useAccount()
  const { usde, yieldEngine, yusde, vault, perpdex, isLoading, hasError, error } = useContracts()
  const { toast } = useToast()
  
  const [testAmount, setTestAmount] = useState('1.0')
  const [isTesting, setIsTesting] = useState(false)
  
  const isSupported = chain ? isChainSupported(chain.id) : false

  const testResults = [
    {
      name: 'USDe Contract',
      status: usde.balance !== undefined ? 'connected' : 'loading',
      data: usde.balance ? formatEther(usde.balance as bigint) : '0.00',
      unit: 'USDe',
      icon: <Coins className="h-4 w-4" />
    },
    {
      name: 'Yield Engine',
      status: yieldEngine.sUSDeBalance !== undefined ? 'connected' : 'loading',
      data: yieldEngine.sUSDeBalance ? formatEther(yieldEngine.sUSDeBalance as bigint) : '0.00',
      unit: 'sUSDe',
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      name: 'YUSDe Contract',
      status: yusde.yUSDeBalance !== undefined ? 'connected' : 'loading',
      data: yusde.yUSDeBalance ? formatEther(yusde.yUSDeBalance as bigint) : '0.00',
      unit: 'yUSDe',
      icon: <Zap className="h-4 w-4" />
    },
    {
      name: 'Vault Contract',
      status: vault.userBalance !== undefined ? 'connected' : 'loading',
      data: vault.userBalance ? formatEther(vault.userBalance as bigint) : '0.00',
      unit: 'USDe',
      icon: <Coins className="h-4 w-4" />
    },
    {
      name: 'PerpDEX',
      status: perpdex.hasPosition !== undefined ? 'connected' : 'loading',
      data: perpdex.hasPosition ? 'Active Position' : 'No Position',
      unit: '',
      icon: <TestTube className="h-4 w-4" />
    }
  ]

  const runContractTests = async () => {
    if (!testAmount || isTesting) return
    
    setIsTesting(true)
    
    try {
      const amount = parseEther(testAmount)
      
      // Test 1: Approve USDe for vault
      toast({
        title: "Testing Contract Integration",
        description: "Step 1: Approving USDe for vault...",
      })
      
      await usde.approveForVault(amount)
      
      // Test 2: Deposit to vault
      toast({
        title: "Testing Contract Integration",
        description: "Step 2: Depositing to vault...",
      })
      
      await vault.deposit(amount)
      
      // Test 3: Mint yUSDe
      toast({
        title: "Testing Contract Integration",
        description: "Step 3: Minting yUSDe...",
      })
      
      await vault.mintYUSDe(amount)
      
      toast({
        title: "Contract Tests Successful!",
        description: "All contract interactions completed successfully",
      })
      
    } catch (error) {
      toast({
        title: "Contract Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  // Show network switch if chain is not supported
  if (!isSupported) {
    return <NetworkSwitch />
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="h-5 w-5" />
          <span>Enhanced Contract Integration Test</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          {/* Status Tab */}
          <TabsContent value="status" className="space-y-4">
            <div className="space-y-2">
              {testResults.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {test.status === 'connected' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : test.status === 'loading' ? (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    {test.icon}
                    <span className="font-medium">{test.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono">{test.data}</div>
                    {test.unit && <div className="text-xs text-muted-foreground">{test.unit}</div>}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Test Tab */}
          <TabsContent value="test" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-amount">Test Amount (USDe)</Label>
                <Input
                  id="test-amount"
                  type="number"
                  placeholder="1.0"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                />
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Test Sequence:</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>1. Approve USDe for vault</div>
                  <div>2. Deposit USDe to vault</div>
                  <div>3. Mint yUSDe using sUSDe collateral</div>
                </div>
              </div>

              <Button 
                onClick={runContractTests} 
                disabled={isTesting || !testAmount}
                className="w-full"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Run Contract Tests
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-4">
            {/* Contract Addresses */}
            <div>
              <div className="text-sm font-medium mb-2">Contract Addresses (Sepolia)</div>
              <div className="space-y-1 text-xs font-mono text-muted-foreground">
                <div>USDe: 0x5e034a923D3947A2fE04172EA9cB3D35EA1f2abA</div>
                <div>YieldEngine: 0x5E63123AB3970e4A25a17103A8552C4555f3C4B8</div>
                <div>YUSDe: 0x21c4cE8cAEE307a47E1EC35De871b02580e6E6cE</div>
                <div>Vault: 0xC8298b7abC7a9298936d3Fe0CE71c2e10919C203</div>
                <div>PerpDEX: 0x2a0fADd0e2e918A5238991AD759c5a09F9A10942</div>
              </div>
            </div>

            {/* Integration Status */}
            <div>
              <div className="text-sm font-medium mb-2">Integration Status</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>✅ Contract addresses configured</div>
                <div>✅ ABIs integrated</div>
                <div>✅ Hooks created</div>
                <div>✅ Provider setup</div>
                <div>✅ UI components created</div>
                <div>✅ Error handling implemented</div>
                <div>✅ Transaction testing enabled</div>
              </div>
            </div>

            {/* Features */}
            <div>
              <div className="text-sm font-medium mb-2">Available Features</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• USDe token operations (mint, burn, transfer)</div>
                <div>• Yield Engine staking (stake, unstake, claim yield)</div>
                <div>• YUSDe minting with sUSDe collateral</div>
                <div>• Vault deposit/withdraw operations</div>
                <div>• PerpDEX position management</div>
                <div>• Real-time balance tracking</div>
                <div>• Transaction status monitoring</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
