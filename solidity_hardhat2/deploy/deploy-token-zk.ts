import { Wallet } from "zksync-ethers"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { Deployer } from "@matterlabs/hardhat-zksync-deploy"

// 🔧 BigInt serialization fix
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log("🦉 Deploying myToken (NOWL) to zkSync Sepolia...")

  // ✅ YOUR SUPERIOR ERROR HANDLING
  const privateKey = process.env.SEPOLIA_PRIVATE_KEY
  if (!privateKey) {
    throw new Error("❌ SEPOLIA_PRIVATE_KEY not found in .env")
  }

  // Initialize zkSync wallet
  const wallet = new Wallet(privateKey)

  // Create deployer
  const deployer = new Deployer(hre, wallet)
  const artifact = await deployer.loadArtifact("myToken")

  // CONSTRUCTOR ARGUMENT: initialSupply
  const initialSupply = hre.ethers.parseUnits("1000000", 18)

  const contract = await deployer.deploy(artifact, [initialSupply])

  await contract.waitForDeployment()

  const contractAddress = await contract.getAddress()

  console.log("✅ myToken (NOWL) deployed to:", contractAddress)
  console.log(
    "🔗 View on zkSync Sepolia Explorer:",
    `https://sepolia.era.zksync.dev/address/${contractAddress}`
  )

  return contract
}
