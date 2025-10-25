'use client'

import { useContracts } from '@/providers/contracts-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatEther } from 'viem'
import { RefreshCw } from 'lucide-react'

export function ContractBalances() {
  const { usde, yieldEngine, yusde, vault, isLoading } = useContracts()

  const handleRefresh = () => {
    usde.refetchBalance()
    yieldEngine.refetchSUSDeBalance()
    yusde.refetchYUSDeBalance()
    vault.refetchUserBalance()
    vault.refetchUserSUSDeBalance()
    vault.refetchUserYUSDeBalance()
    vault.refetchUserYield()
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Token Balances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Token Balances</CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* USDe Balance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">USDe</Badge>
            <span className="text-sm text-muted-foreground">Base Token</span>
          </div>
          <div className="text-right">
            <div className="font-mono text-sm">
              {usde.balance && typeof usde.balance === 'bigint' ? formatEther(usde.balance) : '0.00'}
            </div>
            <div className="text-xs text-muted-foreground">USDe</div>
          </div>
        </div>

        {/* sUSDe Balance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">sUSDe</Badge>
            <span className="text-sm text-muted-foreground">Staked Token</span>
          </div>
          <div className="text-right">
            <div className="font-mono text-sm">
              {yieldEngine.sUSDeBalance && typeof yieldEngine.sUSDeBalance === 'bigint' ? formatEther(yieldEngine.sUSDeBalance) : '0.00'}
            </div>
            <div className="text-xs text-muted-foreground">sUSDe</div>
          </div>
        </div>

        {/* yUSDe Balance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="destructive">yUSDe</Badge>
            <span className="text-sm text-muted-foreground">Margin Token</span>
          </div>
          <div className="text-right">
            <div className="font-mono text-sm">
              {yusde.yUSDeBalance && typeof yusde.yUSDeBalance === 'bigint' ? formatEther(yusde.yUSDeBalance) : '0.00'}
            </div>
            <div className="text-xs text-muted-foreground">yUSDe</div>
          </div>
        </div>

        {/* Yield Information */}
        {yieldEngine.userYield && yieldEngine.userYield > 0n && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Yield</Badge>
              <span className="text-sm text-muted-foreground">Available</span>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm text-green-600">
                +{formatEther(yieldEngine.userYield)}
              </div>
              <div className="text-xs text-muted-foreground">USDe</div>
            </div>
          </div>
        )}

        {/* Vault Information */}
        {vault.vaultInfo && (
          <div className="pt-2 border-t space-y-2">
            <div className="text-xs text-muted-foreground">Vault Stats</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Total Deposits</div>
                <div className="font-mono">
                  {typeof vault.vaultInfo[0] === 'bigint' ? formatEther(vault.vaultInfo[0]) : '0.00'}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Total Staked</div>
                <div className="font-mono">
                  {typeof vault.vaultInfo[1] === 'bigint' ? formatEther(vault.vaultInfo[1]) : '0.00'}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
