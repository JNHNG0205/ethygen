# React Hooks Order Fix

## Problem
React was detecting a change in the order of hooks called by `ContractsProvider`, which violates the Rules of Hooks and leads to bugs and errors.

## Root Cause
The contract hooks were using conditional early returns before calling wagmi hooks, which caused the hook order to change between renders:

```typescript
// ❌ BAD: Conditional hook calls
if (!contractConfig) {
  return { ... } // Early return before hooks
}

const { data: balance } = useReadContract({ ... }) // Hook called conditionally
```

## Solution
Ensured all hooks are always called in the same order by:

1. **Removing early returns** before hook calls
2. **Using conditional enabling** in hook options instead
3. **Adding chain support checks** in function implementations

## Changes Made

### Before (❌ Problematic)
```typescript
export const useUSDe = () => {
  const contractConfig = getContractConfig(chainId)
  
  // Early return - violates Rules of Hooks
  if (!contractConfig) {
    return { ... }
  }
  
  // Hooks called conditionally
  const { data: balance } = useReadContract({ ... })
}
```

### After (✅ Fixed)
```typescript
export const useUSDe = () => {
  const contractConfig = getContractConfig(chainId)
  const isSupported = !!contractConfig
  
  // Always call hooks in same order
  const { data: balance } = useReadContract({
    address: contractConfig?.USDe.address,
    abi: contractConfig?.USDe.abi,
    query: {
      enabled: !!address && isSupported, // Conditional enabling
    },
  })
  
  // Check support in function implementations
  const approveForVault = async (amount: bigint) => {
    if (!contractConfig) throw new Error('Unsupported chain')
    // ...
  }
}
```

## Applied to All Hooks
- ✅ `useUSDe` - Fixed conditional hook calls
- ✅ `useYieldEngine` - Fixed conditional hook calls  
- ✅ `useYUSDe` - Fixed conditional hook calls
- ✅ `useVault` - Fixed conditional hook calls
- ✅ `usePerpDEX` - Fixed conditional hook calls

## Key Principles
1. **Always call hooks in the same order** - No conditional hook calls
2. **Use `enabled` option** - Disable hooks conditionally instead of not calling them
3. **Check conditions in implementations** - Validate chain support in function bodies
4. **Consistent hook order** - Same hooks called every render

## Result
- ✅ No more React hooks order errors
- ✅ Consistent hook behavior across renders
- ✅ Proper chain support handling
- ✅ All contract functionality preserved

The application now follows React's Rules of Hooks correctly while maintaining all the contract integration functionality.
