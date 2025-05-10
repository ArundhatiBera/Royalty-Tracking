const fs = require('fs');
const hre = require('hardhat');

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log('Deploying contract with account:', deployer.address);

    // Sample stakeholders
    const stakeholders = [
        '0x1111111111111111111111111111111111111111',
        '0x2222222222222222222222222222222222222222',
    ];
    const percentages = [60, 40]; // Must total 100

    // Get contract factory and deploy
    const RoyaltyDistribution = await hre.ethers.getContractFactory('RoyaltyDistribution');
    const contract = await RoyaltyDistribution.deploy(stakeholders, percentages);

    await contract.waitForDeployment();

    console.log('RoyaltyDistribution deployed to:', contract.address);

    // Save contract address and bytecode
    const artifact = await hre.artifacts.readArtifact('RoyaltyDistribution');
    const bytecode = artifact.bytecode;

    const output = `Address: ${contract.address}\nBytecode: ${bytecode}`;

    fs.writeFileSync('deployment-output.txt', output);
    console.log('Deployment details saved to deployment-output.txt');
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});