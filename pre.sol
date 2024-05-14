// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract MedicalData is AccessControl {
    struct PatientRecord {
        string name;
        uint age;
        string condition;
        string encryptedData;  // 加密的医疗数据
        mapping(address => bool) accessPermissions;  // 访问权限列表
        address owner;  // 数据拥有者
        bytes32 dataHash;  // 数据哈希值，用于验证数据完整性
    }

    mapping(uint256 => PatientRecord) public patientRecords;

    event DataUpdated(uint256 indexed patientId);
    event AccessGranted(uint256 indexed patientId, address indexed user);
    event AccessRevoked(uint256 indexed patientId, address indexed user);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // 设置患者数据（数据拥有者为msg.sender）
    function setPatientData(uint256 patientId, string memory name, uint age, string memory condition, string memory encryptedData, bytes32 dataHash) public {
        require(age > 0, "Age must be positive");  // 确保年龄为正整数
        PatientRecord storage record = patientRecords[patientId];
        record.name = name;
        record.age = age;
        record.condition = condition;
        record.encryptedData = encryptedData;
        record.dataHash = dataHash;
        record.owner = msg.sender;
        record.accessPermissions[msg.sender] = true;  // 自动为数据拥有者授予访问权限
        emit DataUpdated(patientId);
    }

    // 授权用户访问患者数据（只有数据拥有者可以授权）
    function authorizeAccess(uint256 patientId, address user) public {
        require(patientRecords[patientId].owner == msg.sender, "Only the owner can grant access.");
        patientRecords[patientId].accessPermissions[user] = true;
        emit AccessGranted(patientId, user);
    }

    // 撤销用户对患者数据的访问权限（只有数据拥有者可以撤销）
    function revokeAccess(uint256 patientId, address user) public {
        require(patientRecords[patientId].owner == msg.sender, "Only the owner can revoke access.");
        patientRecords[patientId].accessPermissions[user] = false;
        emit AccessRevoked(patientId, user);
    }

    // 获取患者数据（只有被授权用户可以访问）
    function getPatientData(uint256 patientId) public view returns (string memory, uint, string memory, string memory) {
        require(patientRecords[patientId].accessPermissions[msg.sender] || patientRecords[patientId].owner == msg.sender, "Access denied.");
        PatientRecord storage record = patientRecords[patientId];
        return (record.name, record.age, record.condition, record.encryptedData);
    }
}
