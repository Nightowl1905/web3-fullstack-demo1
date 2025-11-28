import * as dotenv from "dotenv"
import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox" // Fixed typo: Foundation not Foundation
import "@matterlabs/hardhat-zksync-solc"
import "@matterlabs/hardhat-zksync-deploy"
import "@matterlabs/hardhat-zksync-verify"

dotenv.config()

const config: HardhatUserConfig = {
  zksolc: {
    version: "1.5.14",
    settings: {
      enableEraVMExtensions: false, // Fixed: replaced isSystem
      forceEVMLA: false, // Fixed: replaced forceEvmia and corrected spelling
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "localhost", // Changed to existing network
  networks: {
    // L1 - Your existing local blockchain
    hardhat: {
      zksync: false,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      zksync: false,
    },
    // L2 - zkSync Local Testnet
    zkSyncLocal: {
      url: "http://localhost:3050", // zkSync local node
      ethNetwork: "http://localhost:8545", // Your Hardhat L1 node
      zksync: true,
    },
    // L2 - zkSync Sepolia Testnet
    zkSyncTestnet: {
      url: "https://sepolia.era.zksync.dev",
      ethNetwork: "sepolia", // Sepolia L1 RPC
      zksync: true,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY!], // Your wallet private key
      verifyURL:
        "https://explorer.sepolia.era.zksync.dev/contract_verification",
      timeout: 60000,
    },
  },
  solidity: {
    version: "0.8.28", // Fixed: object, not array
  },
}

export default config // Added missing export
