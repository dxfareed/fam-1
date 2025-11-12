// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ReligiousWarplet is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    uint256 public mintFee;

    constructor(uint256 _initialMintFee) ERC721("Religious Warplet", "RELWAR") Ownable(msg.sender) {
        mintFee = _initialMintFee;
    }

    function setMintFee(uint256 _fee) public onlyOwner {
        mintFee = _fee;
    }

    function safeMint(address to, string memory uri) public payable {
        require(msg.value == mintFee, "Incorrect mint fee");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    function rescueTokens(address _tokenAddress, uint256 _amount) public onlyOwner {
        IERC20(_tokenAddress).transfer(owner(), _amount);
    }
}