// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {TimesTwoStorage} from "./timesTwoStorage.sol";

contract TimesTwoStorageFactory {
    // Array of TimesTwoStorage contracts (each multiplies by 2!)
    TimesTwoStorage[] public listOfTimesTwoStorage;

    // Create new TimesTwoStorage contract
    function createTimesTwoStorageContract() public {
        TimesTwoStorage newContract = new TimesTwoStorage();
        listOfTimesTwoStorage.push(newContract);
    }

    // Store number in specific contract (will be ×2!)
    function sfStore(uint256 _index, uint256 _number) public {
        listOfTimesTwoStorage[_index].store(_number);
    }

    function sfAddPerson(
        uint256 _index,
        string calldata _name,
        uint256 _number
    ) public {
        listOfTimesTwoStorage[_index].addPerson(_name, _number);
    }

    // Retrieve number from specific contract
    function sfGet(uint256 _index) public view returns (uint256) {
        return listOfTimesTwoStorage[_index].retrieve();
    }

    function sfGetPersonNumber(
        uint256 _index,
        string calldata _name
    ) public view returns (uint256) {
        return listOfTimesTwoStorage[_index].nameToFavoriteNumber(_name);
    }

    // Get contract address at index
    function getContractAddress(uint256 _index) public view returns (address) {
        return address(listOfTimesTwoStorage[_index]);
    }

    // Get total number of contracts created
    function getContractCount() public view returns (uint256) {
        return listOfTimesTwoStorage.length;
    }
}
