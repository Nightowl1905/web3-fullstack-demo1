import { signer } from "./core/wallet.js"
import { initContract, executeTransaction } from "./core/contract.js"

let factoryContract = null
let currentContractIndex = 0

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize factory contract with auto-loading contract info
 */
async function initFactoryContract() {
  factoryContract = await initContract("storage", {
    onSuccess: async (contract) => {
      // Factory-specific initialization
      await updateContractInfo(contract)
    },
  })

  return factoryContract !== null
}

/**
 * Update UI with contract count and current contract address
 * @param {ethers.Contract} contract - Factory contract instance (optional, uses global if not provided)
 */
async function updateContractInfo(contract = factoryContract) {
  if (!contract) return

  try {
    const count = await contract.getContractCount()

    // Update contract count display
    const countElement = document.getElementById("contractCount")
    if (countElement) {
      countElement.textContent = count.toString()
    }

    // If contracts exist, show first contract address
    if (count > 0) {
      const firstAddress = await contract.getContractAddress(0)
      const addressElement = document.getElementById("currentContractAddress")
      if (addressElement) {
        addressElement.textContent = `${firstAddress.slice(
          0,
          6
        )}...${firstAddress.slice(-4)}`
      }
    }

    console.log(`✅ Contract count: ${count}`)
  } catch (error) {
    console.error("❌ Failed to update contract info:", error)
  }
}

// ============================================
// EVENT HANDLERS - FACTORY OPERATIONS
// ============================================

/**
 * Create new TimesTwoStorage contract
 */
document
  .getElementById("createContractBtn")
  ?.addEventListener("click", async () => {
    // Initialize if needed
    if (!factoryContract) {
      const initialized = await initFactoryContract()
      if (!initialized) return
    }

    const statusElement = document.getElementById("factoryStatus")

    // Execute with shared helper!
    const receipt = await executeTransaction(
      () => factoryContract.createTimesTwoStorageContract(),
      {
        statusElement,
        pendingMsg: "Creating new TimesTwoStorage contract...",
        successMsg: "Contract created successfully!",
      }
    )

    // If successful, get new contract details
    if (receipt) {
      try {
        const count = await factoryContract.getContractCount()
        const newIndex = count - 1 // Latest contract index
        const newAddress = await factoryContract.getContractAddress(newIndex)

        console.log(`✅ New contract #${newIndex} at ${newAddress}`)

        // ✅ DIRECT UPDATE: Update count display immediately!
        const countElement = document.getElementById("contractCount")
        if (countElement) {
          countElement.textContent = count.toString() // ← DIRECT UPDATE!
        }

        // ✅ DIRECT UPDATE: Update current contract address display!
        const addressElement = document.getElementById("currentContractAddress")
        if (addressElement) {
          addressElement.textContent = `${newAddress.slice(
            0,
            6
          )}...${newAddress.slice(-4)}`
        }

        // Update status with contract details
        if (statusElement) {
          statusElement.innerHTML =
            `✅ Contract #${newIndex} created!<br>` +
            `Address: ${newAddress}<br>` +
            `Block: ${receipt.blockNumber}<br>` +
            `Total Contracts: ${count}` // ← Show count in status too!
        }

        // ✅ OPTIONAL: Still call updateContractInfo() as backup
        // await updateContractInfo()  // ← Can remove this if direct update works!
      } catch (error) {
        console.error("❌ Failed to fetch new contract details:", error)
      }
    }
  })

/**
 * ✅ NEW: Load specific contract by index
 */
document
  .getElementById("loadContractBtn")
  ?.addEventListener("click", async () => {
    const indexInput = document.getElementById("contractIndex")
    const newIndex = parseInt(indexInput?.value || "0")

    if (!factoryContract) {
      const initialized = await initFactoryContract()
      if (!initialized) return
    }

    try {
      const count = await factoryContract.getContractCount()

      if (newIndex >= count || newIndex < 0) {
        alert(`Contract #${newIndex} doesn't exist! Total contracts: ${count}`)
        return
      }

      // Update global current index
      currentContractIndex = newIndex

      // Get and display contract address
      const address = await factoryContract.getContractAddress(newIndex)

      const addressElement = document.getElementById("currentContractAddress")
      if (addressElement) {
        addressElement.textContent = `${address.slice(0, 6)}...${address.slice(
          -4
        )}`
      }

      const statusElement = document.getElementById("factoryStatus")
      if (statusElement) {
        statusElement.innerHTML =
          `✅ Loaded Contract #${newIndex}<br>` + `Address: ${address}`
      }

      console.log(`✅ Switched to contract #${newIndex} at ${address}`)
    } catch (error) {
      console.error("❌ Failed to load contract:", error)
      alert(`Failed to load contract: ${error.message}`)
    }
  })

/**
 * ✅ REVISED: Store number (×2!) - NOW READS storeContractIndex
 */
document
  .getElementById("storeNumberBtn")
  ?.addEventListener("click", async () => {
    // Initialize if needed
    if (!factoryContract) {
      const initialized = await initFactoryContract()
      if (!initialized) return
    }

    // ✅ Read contract index from input
    const indexInput = document.getElementById("storeContractIndex")
    const contractIndex = parseInt(indexInput?.value || "0")

    const numberInput = document.getElementById("storeInput")
    const number = numberInput?.value

    if (!number) {
      alert("Please enter a number!")
      return
    }

    const statusElement = document.getElementById("factoryStatus")

    // ✅ Use contractIndex from input!
    const receipt = await executeTransaction(
      () => factoryContract.sfStore(contractIndex, number),
      {
        statusElement,
        pendingMsg: `Storing ${number} to contract #${contractIndex} (will be ×2!)...`,
        successMsg: "Number stored successfully!",
      }
    )

    // If successful, retrieve to show result
    if (receipt) {
      try {
        const stored = await factoryContract.sfGet(contractIndex)

        console.log(
          `✅ Stored to contract #${contractIndex}! Original: ${number}, After ×2: ${stored}`
        )

        // Update status with result
        if (statusElement) {
          statusElement.innerHTML =
            `✅ Stored to Contract #${contractIndex}!<br>` +
            `Original: ${number}<br>` +
            `After ×2: ${stored.toString()} 🔥`
        }
      } catch (error) {
        console.error("❌ Failed to retrieve stored value:", error)
      }
    }
  })

/**
 * ✅ REVISED: Add person - NOW READS addPersonContractIndex
 */
document.getElementById("addPersonBtn")?.addEventListener("click", async () => {
  // Initialize if needed
  if (!factoryContract) {
    const initialized = await initFactoryContract()
    if (!initialized) return
  }

  // ✅ Read contract index from input
  const indexInput = document.getElementById("addPersonContractIndex")
  const contractIndex = parseInt(indexInput?.value || "0")

  const nameInput = document.getElementById("personName")
  const numberInput = document.getElementById("personNumber")

  const name = nameInput?.value
  const number = numberInput?.value

  if (!name || !number) {
    alert("Please enter both name and number!")
    return
  }

  const statusElement = document.getElementById("factoryStatus")

  // ✅ Use contractIndex from input!
  const receipt = await executeTransaction(
    () => factoryContract.sfAddPerson(contractIndex, name, number),
    {
      statusElement,
      pendingMsg: `Adding ${name} to contract #${contractIndex}...`,
      successMsg: "Person added successfully!",
    }
  )

  // If successful, verify the stored value
  if (receipt) {
    try {
      const stored = await factoryContract.sfGetPersonNumber(
        contractIndex,
        name
      )

      console.log(
        `✅ Person added to contract #${contractIndex}! ${name}'s number: ${stored}`
      )

      // Update status with result
      if (statusElement) {
        statusElement.innerHTML =
          `✅ Person added to Contract #${contractIndex}!<br>` +
          `${name}'s number: ${stored.toString()}<br>` +
          `(Original value, NOT doubled)`
      }

      // Clear inputs
      if (nameInput) nameInput.value = ""
      if (numberInput) numberInput.value = ""
    } catch (error) {
      console.error("❌ Failed to verify added person:", error)
    }
  }
})

/**
 * ✅ REVISED: Retrieve favorite number - NOW READS retrieveContractIndex AND UPDATES retrievedValue
 */
document
  .getElementById("retrieveNumberBtn")
  ?.addEventListener("click", async () => {
    // Initialize if needed
    if (!factoryContract) {
      const initialized = await initFactoryContract()
      if (!initialized) return
    }

    try {
      // ✅ Read contract index from input
      const indexInput = document.getElementById("retrieveContractIndex")
      const contractIndex = parseInt(indexInput?.value || "0")

      const statusElement = document.getElementById("factoryStatus")

      console.log(
        `🔍 Retrieving favorite number from contract #${contractIndex}...`
      )

      const number = await factoryContract.sfGet(contractIndex)

      console.log(`✅ Retrieved from contract #${contractIndex}: ${number}`)

      // ✅ Update the dedicated retrievedValue element!
      const valueElement = document.getElementById("retrievedValue")
      if (valueElement) {
        valueElement.textContent = number.toString()
      }

      // Also update status
      if (statusElement) {
        statusElement.innerHTML =
          `✅ Retrieved from Contract #${contractIndex}<br>` +
          `My Favorite Number: ${number.toString()} (Already ×2!)`
      }
    } catch (error) {
      console.error("❌ Retrieve failed:", error)

      const statusElement = document.getElementById("factoryStatus")
      if (statusElement) {
        statusElement.innerHTML = `❌ Error: ${error.message}`
      }

      alert(`Failed to retrieve number: ${error.message}`)
    }
  })

/**
 * ✅ REVISED: Retrieve person's number - NOW READS getPersonContractIndex AND UPDATES retrievedPersonNumber
 */
document
  .getElementById("retrievePersonBtn")
  ?.addEventListener("click", async () => {
    // Initialize if needed
    if (!factoryContract) {
      const initialized = await initFactoryContract()
      if (!initialized) return
    }

    try {
      // ✅ Read contract index from input
      const indexInput = document.getElementById("getPersonContractIndex")
      const contractIndex = parseInt(indexInput?.value || "0")

      const nameInput = document.getElementById("retrieveName")
      const name = nameInput?.value

      if (!name) {
        alert("Please enter a name!")
        return
      }

      const statusElement = document.getElementById("factoryStatus")

      console.log(
        `🔍 Retrieving ${name}'s number from contract #${contractIndex}...`
      )

      const number = await factoryContract.sfGetPersonNumber(
        contractIndex,
        name
      )

      console.log(
        `✅ Retrieved from contract #${contractIndex}: ${name}'s number = ${number}`
      )

      // ✅ Update the dedicated retrievedPersonNumber element!
      const personNumberElement = document.getElementById(
        "retrievedPersonNumber"
      )
      if (personNumberElement) {
        if (number.toString() === "0") {
          personNumberElement.textContent = `No record found for "${name}"`
          personNumberElement.classList.add("text-danger")
          personNumberElement.classList.remove("text-warning")
        } else {
          personNumberElement.textContent = number.toString()
          personNumberElement.classList.add("text-warning")
          personNumberElement.classList.remove("text-danger")
        }
      }

      // Also update status
      if (statusElement) {
        if (number.toString() === "0") {
          statusElement.innerHTML = `❌ No record found for "${name}" in Contract #${contractIndex}`
        } else {
          statusElement.innerHTML =
            `✅ Retrieved from Contract #${contractIndex}<br>` +
            `${name}'s Favorite Number: ${number.toString()}`
        }
      }
    } catch (error) {
      console.error("❌ Retrieve person failed:", error)

      const statusElement = document.getElementById("factoryStatus")
      if (statusElement) {
        statusElement.innerHTML = `❌ Error: ${error.message}`
      }

      alert(`Failed to retrieve person's number: ${error.message}`)
    }
  })

// ============================================
// AUTO-INITIALIZATION
// ============================================

/**
 * Auto-initialize when Factory tab is shown
 * Professional UX: Lazy initialization
 */
document
  .getElementById("factory-tab")
  ?.addEventListener("shown.bs.tab", async () => {
    console.log("📦 Factory tab activated")

    if (signer && !factoryContract) {
      console.log("🔄 Auto-initializing factory contract...")
      await initFactoryContract()
    } else if (!signer) {
      console.warn("⚠️ Wallet not connected. Please connect first.")
    }
  })

export { initFactoryContract }
