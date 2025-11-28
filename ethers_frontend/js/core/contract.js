// ============================================
// CONTRACT.JS - Shared Contract Utilities
// ============================================
import { provider, signer } from "./wallet.js"
import { getActiveNetwork } from "./config.js"

// ============================================
// SHARED: Network Verification
// ============================================

/**
 * Verify user is on correct network
 *
 * @returns {Promise<boolean>} True if on correct network or switched successfully
 */
export async function verifyNetwork() {
  try {
    const activeNetwork = getActiveNetwork()
    const currentChainId = await window.ethereum.request({
      method: "eth_chainId",
    })

    if (currentChainId !== activeNetwork.chainId) {
      console.warn(`⚠️ Network mismatch!`)
      console.warn(`Expected: ${activeNetwork.name} (${activeNetwork.chainId})`)
      console.warn(`Current: ${currentChainId}`)

      // Prompt user to switch network
      const userConfirm = confirm(
        `⚠️ Wrong network detected!\n\n` +
          `Please switch MetaMask to: ${activeNetwork.name}\n\n` +
          `Click OK to attempt automatic switch.`
      )

      if (userConfirm) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: activeNetwork.chainId }],
          })
          console.log(`✅ Switched to ${activeNetwork.name}!`)
          return true
        } catch (switchError) {
          console.error(`❌ Failed to switch network:`, switchError)
          alert(`Please manually switch to ${activeNetwork.name} in MetaMask.`)
          return false
        }
      }

      return false
    }

    console.log(`✅ Network verified: ${activeNetwork.name}`)
    return true
  } catch (error) {
    console.error("❌ Network verification failed:", error)
    return false
  }
}

// ============================================
// SHARED: ABI Loader
// ============================================

/**
 * Load contract ABI from file
 * Generic function - works for any contract type
 *
 * @param {string} abiPath - Path to ABI JSON file
 * @returns {Promise<Array|null>} ABI array or null if failed
 */
export async function loadABI(abiPath) {
  try {
    const response = await fetch(abiPath)

    if (!response.ok) {
      throw new Error(`Failed to fetch ABI: ${response.statusText}`)
    }

    const contractData = await response.json()
    const abi = contractData.abi

    console.log(`✅ ABI loaded from ${abiPath}`)
    return abi
  } catch (error) {
    console.error(`❌ Failed to load ABI from ${abiPath}:`, error)
    alert(`Failed to load ABI: ${error.message}`)
    return null
  }
}

// ============================================
// SHARED: Contract Initialization Pattern
// ============================================

/**
 * Initialize contract with standard checks
 * Generic pattern used across all contract types
 *
 * @param {string} contractType - Type from config ("token", "storage", etc.)
 * @param {Object} options - Optional callbacks
 * @param {Function} options.onSuccess - Called after successful init
 * @returns {Promise<ethers.Contract|null>} Initialized contract or null
 */
export async function initContract(contractType, options = {}) {
  // Step 1: Check wallet connection
  if (!signer) {
    alert("Please connect wallet first!")
    return null
  }

  // Step 2: Verify network
  const networkOk = await verifyNetwork()
  if (!networkOk) {
    console.error("❌ Network verification failed!")
    return null
  }

  // Step 3: Get contract config
  const config = getContractConfig(contractType)
  if (!config) {
    console.error(`❌ No config found for contract type: ${contractType}`)
    return null
  }

  // Step 4: Load ABI
  const abi = await loadABI(config.abiPath)
  if (!abi) {
    return null
  }

  // Step 5: Create contract instance
  try {
    const contract = new ethers.Contract(config.address, abi, signer)

    const activeNetwork = getActiveNetwork()
    console.log(
      `✅ ${contractType} contract initialized on ${activeNetwork.name}`
    )
    console.log(`📍 Contract address: ${config.address}`)

    // Step 6: Call success callback if provided
    if (options.onSuccess) {
      await options.onSuccess(contract)
    }

    return contract
  } catch (error) {
    console.error(`❌ Contract initialization failed:`, error)
    alert(`Failed to initialize contract: ${error.message}`)
    return null
  }
}

// ============================================
// HELPER: Get contract config (re-export for convenience)
// ============================================

import { getContractConfig } from "./config.js"
export { getContractConfig }

// ============================================
// SHARED: Transaction Helper
// ============================================

/**
 * Execute transaction with standard error handling
 * Reduces boilerplate in specific contract files [[2]][doc_2]
 *
 * @param {Function} txFunction - Async function that returns transaction
 * @param {Object} options - Status callbacks
 * @param {HTMLElement} options.statusElement - Element to update status
 * @param {string} options.pendingMsg - Message while pending
 * @param {string} options.successMsg - Message on success
 * @returns {Promise<Object|null>} Transaction receipt or null
 */
export async function executeTransaction(txFunction, options = {}) {
  const { statusElement, pendingMsg, successMsg } = options

  try {
    // Update status: Preparing
    if (statusElement && pendingMsg) {
      statusElement.innerHTML = `⏳ ${pendingMsg}`
    }

    // Send transaction
    const tx = await txFunction()
    console.log(`📤 Transaction sent: ${tx.hash}`)

    // Update status: Waiting
    if (statusElement) {
      statusElement.innerHTML = `⏳ Waiting for confirmation... (${tx.hash.slice(
        0,
        10
      )}...)`
    }

    // Wait for confirmation
    const receipt = await tx.wait()

    console.log(`✅ Transaction confirmed! Block: ${receipt.blockNumber}`)

    // Update status: Success
    if (statusElement && successMsg) {
      statusElement.innerHTML = `✅ ${successMsg}<br>Block: ${receipt.blockNumber}`
    }

    return receipt
  } catch (error) {
    console.error("❌ Transaction failed:", error)

    // Update status: Error
    if (statusElement) {
      statusElement.innerHTML = `❌ Error: ${error.message}`
    }

    // User-friendly error messages
    if (error.code === "INSUFFICIENT_FUNDS") {
      alert("Insufficient balance for this transaction!")
    } else if (error.code === "ACTION_REJECTED") {
      alert("Transaction rejected by user.")
    } else {
      alert(`Transaction failed: ${error.message}`)
    }

    return null
  }
}
