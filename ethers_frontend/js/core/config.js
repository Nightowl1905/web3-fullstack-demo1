const local_add = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
export const NETWORKS = {
  LOCAL_L1: {
    name: "L1 (Hardhat)",
    chainId: "0x7a69", // 31337
    rpc: "http://127.0.0.1:8545",
    contracts: {
      storage: {
        address: local_add,
        abiPath: "./abi/timesTwoStorageFactory.json",
      },
      token: {
        address: local_add,
        abiPath: "./abi/myToken.json",
      },
    },
  },

  TESTNET_L2: {
    name: "L2 (zkSync Sepolia)",
    chainId: "0x12c", // 300
    rpc: "https://sepolia.era.zksync.dev",
    contracts: {
      storage: {
        address: "0x0B1e1543ed450c7b302eb1842af1c878Af2Ae30d",
        abiPath: "./abi/zk_timesTwoStorageFactory.json",
      },
      token: {
        address: "0x57aDB5f1C28eeE9A7cF6B052385c90c7bB707761",
        abiPath: "./abi/zk_myToken.json",
      },
    },
  },
}

// SINGLE SWITCH! Change here = changes everywhere!
export let ACTIVE_NETWORK = "TESTNET_L2"

export function getActiveNetwork() {
  return NETWORKS[ACTIVE_NETWORK]
}

export function getContractConfig(contractType) {
  return NETWORKS[ACTIVE_NETWORK].contracts[contractType]
}
