// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {SimpleStorage} from "./simpleStorage.sol";

contract TimesTwoStorage is SimpleStorage {
    function store(uint256 _favoriteNumber) public override {
        myFavoriteNumber = _favoriteNumber * 2;
    }
}
