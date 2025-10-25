'use client'

import { useContracts } from '@/providers/contracts-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatEther } from 'viem'
import { CheckCircle, XCircle, Loader2, RefreshCw, ExternalLink } from 'lucide-react'

export function TransactionStatus() {
  const { usde, yieldEngine, yusde, vault, perpdex } = useContracts()

  const handleRefresh = () => {
    usde.refetchBalance()
    yieldEngine.refetchSUSDeBalance()
    yusde.refetchYUSDeBalance()
    vault.refetchUserBalance()
    vault.refetchUserSUSDeBalance()
    vault.refetchUserYUSDeBalance()
    vault.refetchUserYield()
    vault.refetchVaultInfo()
  }

  const getTransactionStatus = (isPending: boolean, isConfirming: boolean, isConfirmed: boolean, error: any) => {
    if (error) return { status: 'error', icon: <XCircle className="h-4 w-4 text-red-600" />, text: 'Failed' }
    if (isPending || isConfirming) return { status: 'pending', icon: <Loader2 className="h-4 w-4 animate-spin text-blue-600" />, text: 'Processing' }
    if (isConfirmed) return { status: 'success', icon: <CheckCircle className="h-4 w-4 text-green-600" />, text: 'Confirmed' }
    return { status: 'idle', icon: null, text: 'Ready' }
  }

  const transactions = [
    {
      name: 'USDe Operations',
      status: getTransactionStatus(usde.isPending, usde.isConfirming, usde.isConfirmed, usde.error),
      hash: usde.hash,
      balance: usde.balance ? formatEther(usde.balance) : '0.00'
    },
    {
      name: 'Yield Engine',
      status: getTransactionStatus(yieldEngine.isPending, yieldEngine.isConfirming, yieldEngine.isConfirmed, yieldEngine.error),
      hash: yieldEngine.hash,
      balance: yieldEngine.sUSDeBalance ? formatEther(yieldEngine.sUSDeBalance) : '0.00'
    },
    {
      name: 'YUSDe Operations',
      status: getTransactionStatus(yusde.isPending, yusde.isConfirming, yusde.isConfirmed, yusde.error),
      hash: yusde.hash,
      balance: yusde.yUSDeBalance ? formatEther(yusde.yUSDeBalance) : '0.00'
    },
    {
      name: 'Vault Operations',
      status: getTransactionStatus(vault.isPending, vault.isConfirming, vault.isConfirmed, vault.error),
      hash: vault.hash,
      balance: vault.userBalance ? formatEther(vault.userBalance) : '0.00'
    },
    {
      name: 'PerpDEX Trading',
      status: getTransactionStatus(perpdex.isPending, perpdex.isConfirming, perpdex.isConfirmed, perpdex.error),
      hash: perpdex.hash,
      balance: perpdex.hasPosition ? 'Active' : 'No Position'
    }
  ]

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Transaction Status</CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((tx, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {tx.status.icon}
              <div>
                <div className="font-medium">{tx.name}</div>
                <div className="text-sm text-muted-foreground">
                  Balance: {tx.balance}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={
                tx.status.status === 'success' ? 'default' :
                tx.status.status === 'error' ? 'destructive' :
                tx.status.status === 'pending' ? 'secondary' : 'outline'
              }>
                {tx.status.text}
              </Badge>
              {tx.hash && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://sepolia.etherscan.io/tx/${tx.hash}`, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
