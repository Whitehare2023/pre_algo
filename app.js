// app.js
window.addEventListener('load', function () {
    let defaultAccount;

    const loadWeb3 = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            try {
                await window.ethereum.enable(); // 请求访问
                console.log("Web3 is enabled");
                const accounts = await web3.eth.getAccounts();
                defaultAccount = accounts[0];
                console.log("Using account:", defaultAccount);
            } catch (error) {
                console.error("Access denied for web3");
            }
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            console.error("Non-Ethereum browser detected. You should consider trying MetaMask!");
        }
    };

    document.getElementById('loadWeb3').addEventListener('click', loadWeb3);

    // 加密数据
    function encryptData(data, key) {
        return CryptoJS.AES.encrypt(data, key).toString();
    }

    // 解密数据
    function decryptData(encryptedData, key) {
        var bytes  = CryptoJS.AES.decrypt(encryptedData, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    // 代理重加密逻辑 - 密钥转换
    function reEncryptData(encryptedData, oldKey, newKey) {
        let decryptedData = decryptData(encryptedData, oldKey);
        let reEncryptedData = encryptData(decryptedData, newKey);
        return reEncryptedData;
    }

    // 获取合约实例
    async function getContractInstance() {
        const response = await fetch('MedicalDataABI.json');
        const abi = await response.json();
        const contractAddress = 'YOUR_CONTRACT_ADDRESS'; // 填入实际地址
        const contract = new web3.eth.Contract(abi, contractAddress);
        return contract;
    }

    // 从智能合约获取数据
    async function getPatientDataFromContract(patientId) {
        const contract = await getContractInstance();
        let response = await contract.methods.getPatientData(patientId, defaultAccount).call();
        return response;
    }

    // 按钮点击事件：获取患者数据并进行重加密显示
    document.getElementById('getPatientData').addEventListener('click', async function () {
        try {
            const patientId = 1; // 假设的患者ID
            const patientData = await getPatientDataFromContract(patientId);
            const oldKey = "old-secret-key";  // 旧密钥
            const newKey = "new-secret-key";  // 新密钥
            const reEncryptedData = reEncryptData(patientData.encryptedData, oldKey, newKey);
            const displayData = decryptData(reEncryptedData, newKey); // 使用新密钥解密以显示
            document.getElementById('patientData').innerText = `Patient Data: ${displayData}`;
        } catch (error) {
            console.error('Error fetching patient data:', error);
            document.getElementById('patientData').innerText = 'Failed to load data.';
        }
    });
});
