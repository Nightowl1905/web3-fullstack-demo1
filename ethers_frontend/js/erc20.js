import { signer, currentAddress } from "./core/wallet.js" // ✅ Add signer!
import { initContract, executeTransaction } from "./core/contract.js"

let tokenContract = null

// ============================================
// INITIALIZATION (NOW SUPER SIMPLE!)
// ============================================

async function initTokenContract() {
  tokenContract = await initContract("token", {
    onSuccess: async (contract) => {
      // Token-specific initialization
      await loadTotalSupply(contract)
    },
  })

  return tokenContract !== null
}

async function loadTotalSupply(contract) {
  try {
    const totalSupply = await contract.totalSupply()
    const formatted = ethers.formatEther(totalSupply)

    const supplyElement = document.getElementById("totalSupply")
    if (supplyElement) {
      supplyElement.textContent = `${Number(formatted).toLocaleString()} NOWL`
    }

    console.log(`✅ Total Supply: ${formatted} NOWL`)
  } catch (error) {
    console.error("❌ Failed to load total supply:", error)
  }
}

// ============================================
// EVENT HANDLERS (ALSO SIMPLIFIED!)
// ============================================

document
  .getElementById("checkBalanceBtn")
  ?.addEventListener("click", async () => {
    if (!tokenContract) {
      const initialized = await initTokenContract()
      if (!initialized) return
    }

    try {
      console.log(`📊 Checking balance for ${currentAddress}...`)

      const balance = await tokenContract.balanceOf(currentAddress)
      const formatted = ethers.formatEther(balance)

      const balanceElement = document.getElementById("userBalance")
      if (balanceElement) {
        balanceElement.textContent = `${Number(
          formatted
        ).toLocaleString()} NOWL`
      }

      console.log(`✅ Balance: ${formatted} NOWL`)
    } catch (error) {
      console.error("❌ Balance check failed:", error)
      alert(`Failed to check balance: ${error.message}`)
    }
  })

document.getElementById("transferBtn")?.addEventListener("click", async () => {
  if (!tokenContract) {
    const initialized = await initTokenContract()
    if (!initialized) return
  }

  // Get inputs
  const to = document.getElementById("transferTo")?.value
  const amount = document.getElementById("transferAmount")?.value
  const statusElement = document.getElementById("transferStatus")

  // Validate
  if (!to || !amount) {
    alert("Please enter recipient address and amount")
    return
  }

  if (!ethers.isAddress(to)) {
    alert("Invalid recipient address!")
    return
  }

  const amountWei = ethers.parseEther(amount)

  // Execute with shared helper! [[2]][doc_2]
  const receipt = await executeTransaction(
    () => tokenContract.transfer(to, amountWei),
    {
      statusElement,
      pendingMsg: `Transferring ${amount} NOWL to ${to}...`,
      successMsg: `Transfer successful!`,
    }
  )

  // Refresh balance if successful
  if (receipt) {
    setTimeout(() => {
      document.getElementById("checkBalanceBtn")?.click()
    }, 1000)
  }
})

// Auto-init on tab shown
document
  .getElementById("token-tab")
  ?.addEventListener("shown.bs.tab", async () => {
    console.log("🦉 Token tab activated")

    if (!tokenContract) {
      await initTokenContract()
    }
  })

export { initTokenContract }
