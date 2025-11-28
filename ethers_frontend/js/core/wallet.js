// ============================================
// WALLET.JS - Shared Wallet Connection Core
// ============================================

// Export global state
export let provider = null
export let signer = null
export let currentAddress = null

// Connect wallet function
export async function connectWallet() {
  try {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask!")
      return false
    }

    // Request account access
    await window.ethereum.request({ method: "eth_requestAccounts" })

    // Create provider
    provider = new ethers.BrowserProvider(window.ethereum)
    signer = await provider.getSigner()
    currentAddress = await signer.getAddress()

    // Get network info
    const network = await provider.getNetwork()
    const chainId = `0x${network.chainId.toString(16)}`

    console.log(`✅ Wallet connected!`)
    console.log(`📍 Address: ${currentAddress}`)
    console.log(`🌐 Chain ID: ${chainId}`)

    // Update UI
    document.getElementById(
      "walletAddress"
    ).textContent = `Connected: ${currentAddress.slice(
      0,
      6
    )}...${currentAddress.slice(-4)}`

    return true
  } catch (error) {
    console.error("❌ Wallet connection failed:", error)
    return false
  }
}

// Network verification helper
export async function verifyNetwork(expectedChainId, networkName) {
  try {
    const chainId = await window.ethereum.request({ method: "eth_chainId" })

    if (chainId !== expectedChainId) {
      console.warn(`⚠️ Wrong network! Expected ${networkName}`)

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: expectedChainId }],
        })
        console.log(`✅ Switched to ${networkName}!`)
        return true
      } catch (switchError) {
        console.error(`❌ Failed to switch network:`, switchError)
        return false
      }
    }

    console.log(`✅ Already on ${networkName}`)
    return true
  } catch (error) {
    console.error("❌ Network verification failed:", error)
    return false
  }
}

// Initialize wallet button
document
  .getElementById("connectWallet")
  ?.addEventListener("click", connectWallet)
