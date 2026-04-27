// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentRegistry {
    struct DocRecord {
        address uploader;
        uint256 timestamp;
        bool exists;
    }

    // Mapping of SHA-256 hash to its record
    mapping(string => DocRecord) private records;

    event DocumentAnchored(string docHash, address uploader, uint256 timestamp);

    // Function to add a document hash to the blockchain
    function addDocument(string memory _docHash) public {
        require(!records[_docHash].exists, "Document hash already exists on-chain.");

        records[_docHash] = DocRecord({
            uploader: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        emit DocumentAnchored(_docHash, msg.sender, block.timestamp);
    }

    // Function to verify if a hash exists and who anchored it
    function verifyDocument(string memory _docHash) public view returns (bool, address, uint256) {
        DocRecord memory record = records[_docHash];
        return (record.exists, record.uploader, record.timestamp);
    }
}