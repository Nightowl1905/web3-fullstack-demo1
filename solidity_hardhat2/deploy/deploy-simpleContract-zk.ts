import { Wallet } from "zksync-ethers"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { Deployer } from "@matterlabs/hardhat-zksync-deploy"

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log("🚀 Deploying TimesTwoStorageFactory to zkSync Sepolia...")

  const privateKey = process.env.SEPOLIA_PRIVATE_KEY
  if (!privateKey) {
    throw new Error("❌ SEPOLIA_PRIVATE_KEY not found in .env")
  }

  // Initialize zkSync wallet
  const wallet = new Wallet(privateKey)

  // Create deployer
  const deployer = new Deployer(hre, wallet)

  // Load contract artifact
  const artifact = await deployer.loadArtifact("TimesTwoStorageFactory")

  // Deploy contract
  const contract = await deployer.deploy(artifact, [])

  // Wait for deployment
  await contract.waitForDeployment()

  const contractAddress = await contract.getAddress()

  console.log("✅ TimesTwoStorageFactory deployed to:", contractAddress)
  console.log(
    "🔗 View on zkSync Sepolia Explorer:",
    `https://sepolia.era.zksync.dev/address/${contractAddress}`
  )

  return contract
}
