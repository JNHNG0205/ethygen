'use client'

import { useState } from 'react'
import { useContracts } from '@/providers/contracts-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatEther, parseEther } from 'viem'
import { useToast } from '@/hooks/use-toast'
import { Loader2, TrendingUp, TrendingDown, X } from 'lucide-react'

export function PerpDEXTrading() {
  const { perpdex, vault } = useContracts()
  const { toast } = useToast()
  const [positionSize, setPositionSize] = useState('')
  const [collateral, setCollateral] = useState('')
  const [selectedSide, setSelectedSide] = useState<'long' | 'short'>('long')
  const [selectedAsset, setSelectedAsset] = useState('ETH/USD')

  const handleOpenPosition = async () => {
    if (!positionSize || !collateral) return
    
    try {
      const size = parseEther(positionSize)
      const collateralAmount = parseEther(collateral)
      
      await perpdex.openPosition(size, collateralAmount, selectedSide === 'long', selectedAsset)
      
      toast({
        title: "Position Opened",
        description: `Opened ${selectedSide} position for ${positionSize} ${selectedAsset}`,
      })
      
      setPositionSize('')
      setCollateral('')
    } catch (error) {
      toast({
        title: "Position Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      })
    }
  }

  const handleClosePosition = async () => {
    try {
      await perpdex.closePosition(selectedAsset)
      
      toast({
        title: "Position Closed",
        description: "Successfully closed your position",
      })
    } catch (error) {
      toast({
        title: "Close Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      })
    }
  }

  const calculateLeverage = () => {
    if (!positionSize || !collateral) return 0
    const size = parseFloat(positionSize)
    const collateralAmount = parseFloat(collateral)
    return (size / collateralAmount).toFixed(2)
  }

  const isLoading = perpdex.isPending

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Perpetual Trading</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {perpdex.hasPosition ? (
          // Position Management
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Active Position</span>
                <Badge variant={perpdex.position?.isLong ? "default" : "destructive"}>
                  {perpdex.position?.isLong ? "LONG" : "SHORT"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Size</div>
                  <div className="font-mono">
                    {perpdex.position ? formatEther(perpdex.position.size) : '0.00'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Entry Price</div>
                  <div className="font-mono">
                    ${perpdex.position ? formatEther(perpdex.position.entryPrice) : '0.00'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Collateral</div>
                  <div className="font-mono">
                    {perpdex.position ? formatEther(perpdex.position.collateral) : '0.00'} yUSDe
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Health</div>
                  <div className="font-mono">
                    {perpdex.positionHealth ? formatEther(perpdex.positionHealth) : '0.00'}%
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleClosePosition} 
              disabled={isLoading}
              className="w-full"
              variant="destructive"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              Close Position
            </Button>
          </div>
        ) : (
          // Open Position Form
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="asset">Asset</Label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH/USD">ETH/USD</SelectItem>
                  <SelectItem value="BTC/USD">BTC/USD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="side">Side</Label>
              <div className="flex space-x-2">
                <Button
                  variant={selectedSide === 'long' ? 'default' : 'outline'}
                  onClick={() => setSelectedSide('long')}
                  className="flex-1"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Long
                </Button>
                <Button
                  variant={selectedSide === 'short' ? 'default' : 'outline'}
                  onClick={() => setSelectedSide('short')}
                  className="flex-1"
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Short
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position-size">Position Size (USD)</Label>
              <Input
                id="position-size"
                type="number"
                placeholder="1000.00"
                value={positionSize}
                onChange={(e) => setPositionSize(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="collateral">Collateral (yUSDe)</Label>
              <Input
                id="collateral"
                type="number"
                placeholder="100.00"
                value={collateral}
                onChange={(e) => setCollateral(e.target.value)}
              />
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Position Details</div>
              <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                <div>
                  <div className="text-muted-foreground">Leverage</div>
                  <div className="font-mono">{calculateLeverage()}x</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Max Leverage</div>
                  <div className="font-mono">10x</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Your yUSDe Balance:</span>
              <span className="font-mono">
                {vault.userYUSDeBalance ? formatEther(vault.userYUSDeBalance) : '0.00'}
              </span>
            </div>

            <Button 
              onClick={handleOpenPosition} 
              disabled={isLoading || !positionSize || !collateral}
              className="w-full"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
              Open {selectedSide.toUpperCase()} Position
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
