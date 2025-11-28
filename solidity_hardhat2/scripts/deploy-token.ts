import { ethers } from "hardhat"

async function main() {
  console.log("Deploying myToken...")
  const initialSupply = ethers.parseEther("1000000") // 1M tokens

  const Token = await ethers.getContractFactory("myToken")
  const token = await Token.deploy(initialSupply)

  await token.waitForDeployment() // Modern syntax

  console.log("myToken deployed to:", await token.getAddress())
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
