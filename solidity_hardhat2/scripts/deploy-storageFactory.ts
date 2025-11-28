import { ethers } from "hardhat"

async function main() {
  console.log("Deploying TimesTwoStorageFactory...")
  const StorageFactory = await ethers.getContractFactory(
    "TimesTwoStorageFactory"
  )

  const storageFactory = await StorageFactory.deploy()

  await storageFactory.waitForDeployment()

  const address = await storageFactory.getAddress()

  console.log("✅ TimesTwoStorageFactory deployed to:", address)
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
