'use client'

import { useState } from 'react'
import { useContracts } from '@/providers/contracts-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { formatEther, parseEther } from 'viem'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowUpDown, Coins, TrendingUp } from 'lucide-react'
import { GasErrorHandler } from './gas-error-handler'

export function VaultOperations() {
  const { usde, vault, yusde, yieldEngine } = useContracts()
  const { toast } = useToast()
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [mintAmount, setMintAmount] = useState('')
  const [redeemAmount, setRedeemAmount] = useState('')

  const handleDeposit = async () => {
    if (!depositAmount) return
    
    try {
      const amount = parseEther(depositAmount)
      
      // Check if user has sufficient USDe balance
      if (!usde.balance || usde.balance < amount) {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough USDe tokens",
          variant: "destructive",
        })
        return
      }
      
      toast({
        title: "Transaction Started",
        description: "Approving USDe for vault...",
      })
      
      // First approve USDe for vault with a higher amount to avoid approval issues
      const approvalAmount = amount * 2n // Approve 2x the amount for future operations
      await usde.approveForVault(approvalAmount)
      
      toast({
        title: "Approval Complete",
        description: "Depositing USDe to vault...",
      })
      
      // Wait a moment for approval to be processed
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Then deposit
      await vault.deposit(amount)
      
      toast({
        title: "Deposit Successful",
        description: `Successfully deposited ${depositAmount} USDe to vault`,
      })
      
      setDepositAmount('')
      
      // Refresh balances
      usde.refetchBalance()
      vault.refetchUserBalance()
      vault.refetchUserSUSDeBalance()
      
    } catch (error) {
      console.error('Deposit error:', error)
      toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      })
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount) return
    
    try {
      const amount = parseEther(withdrawAmount)
      await vault.withdraw(amount)
      
      toast({
        title: "Withdrawal Successful",
        description: `Withdrew ${withdrawAmount} USDe from vault`,
      })
      
      setWithdrawAmount('')
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      })
    }
  }

  const handleMintYUSDe = async () => {
    if (!mintAmount) return
    
    try {
      const amount = parseEther(mintAmount)
      await vault.mintYUSDe(amount)
      
      toast({
        title: "yUSDe Minted",
        description: `Minted yUSDe using ${mintAmount} sUSDe as collateral`,
      })
      
      setMintAmount('')
    } catch (error) {
      toast({
        title: "Mint Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      })
    }
  }

  const handleRedeemYUSDe = async () => {
    if (!redeemAmount) return
    
    try {
      const amount = parseEther(redeemAmount)
      await vault.redeemYUSDe(amount)
      
      toast({
        title: "yUSDe Redeemed",
        description: `Redeemed ${redeemAmount} yUSDe for sUSDe`,
      })
      
      setRedeemAmount('')
    } catch (error) {
      toast({
        title: "Redeem Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      })
    }
  }

  const handleClaimYield = async () => {
    try {
      await vault.claimYield()
      
      toast({
        title: "Yield Claimed",
        description: "Successfully claimed your yield",
      })
    } catch (error) {
      toast({
        title: "Claim Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      })
    }
  }

  const isLoading = vault.isPending || usde.isPending || yusde.isPending
  const hasError = vault.error || usde.error || yusde.error || yieldEngine.error
  const error = vault.error || usde.error || yusde.error || yieldEngine.error

  const handleRetry = () => {
    // Refetch all data
    usde.refetchBalance()
    vault.refetchUserBalance()
    vault.refetchUserSUSDeBalance()
    vault.refetchUserYUSDeBalance()
    vault.refetchUserYield()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Coins className="h-5 w-5" />
          <span>Vault Operations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Gas Error Handler */}
        {hasError && (
          <GasErrorHandler 
            error={error} 
            onRetry={handleRetry}
          />
        )}
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            <TabsTrigger value="mint">Mint yUSDe</TabsTrigger>
            <TabsTrigger value="redeem">Redeem</TabsTrigger>
          </TabsList>

          {/* Deposit Tab */}
          <TabsContent value="deposit" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deposit-amount">USDe Amount</Label>
              <Input
                id="deposit-amount"
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Your USDe Balance:</span>
              <span className="font-mono">
                {usde.balance ? formatEther(usde.balance) : '0.00'}
              </span>
            </div>
            <Button 
              onClick={handleDeposit} 
              disabled={isLoading || !depositAmount}
              className="w-full"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpDown className="h-4 w-4" />}
              Deposit USDe
            </Button>
          </TabsContent>

          {/* Withdraw Tab */}
          <TabsContent value="withdraw" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">sUSDe Amount</Label>
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Your sUSDe Balance:</span>
              <span className="font-mono">
                {vault.userSUSDeBalance ? formatEther(vault.userSUSDeBalance) : '0.00'}
              </span>
            </div>
            <Button 
              onClick={handleWithdraw} 
              disabled={isLoading || !withdrawAmount}
              className="w-full"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpDown className="h-4 w-4" />}
              Withdraw sUSDe
            </Button>
          </TabsContent>

          {/* Mint yUSDe Tab */}
          <TabsContent value="mint" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mint-amount">sUSDe Amount</Label>
              <Input
                id="mint-amount"
                type="number"
                placeholder="0.00"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Your sUSDe Balance:</span>
              <span className="font-mono">
                {vault.userSUSDeBalance ? formatEther(vault.userSUSDeBalance) : '0.00'}
              </span>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Collateral Ratio: 80%</div>
              <div className="text-sm">
                You will receive: <span className="font-mono">
                  {mintAmount ? formatEther(yusde.getCollateralAmount(parseEther(mintAmount))) : '0.00'}
                </span> yUSDe
              </div>
            </div>
            <Button 
              onClick={handleMintYUSDe} 
              disabled={isLoading || !mintAmount}
              className="w-full"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
              Mint yUSDe
            </Button>
          </TabsContent>

          {/* Redeem Tab */}
          <TabsContent value="redeem" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="redeem-amount">yUSDe Amount</Label>
              <Input
                id="redeem-amount"
                type="number"
                placeholder="0.00"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Your yUSDe Balance:</span>
              <span className="font-mono">
                {vault.userYUSDeBalance ? formatEther(vault.userYUSDeBalance) : '0.00'}
              </span>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Backing Ratio: 125%</div>
              <div className="text-sm">
                You will receive: <span className="font-mono">
                  {redeemAmount ? formatEther(yusde.getBackingAmount(parseEther(redeemAmount))) : '0.00'}
                </span> sUSDe
              </div>
            </div>
            <Button 
              onClick={handleRedeemYUSDe} 
              disabled={isLoading || !redeemAmount}
              className="w-full"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
              Redeem yUSDe
            </Button>
          </TabsContent>
        </Tabs>

        {/* Yield Claim Section */}
        {vault.userYield && vault.userYield > 0n && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Available Yield</div>
                <div className="text-sm text-muted-foreground">
                  {formatEther(vault.userYield)} USDe
                </div>
              </div>
              <Button 
                onClick={handleClaimYield} 
                disabled={isLoading}
                size="sm"
                variant="outline"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                Claim
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
