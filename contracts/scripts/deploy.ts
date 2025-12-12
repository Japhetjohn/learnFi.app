import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);

  // Deploy LearnFi Token
  console.log("\n🪙 Deploying LearnFi Token...");
  const LearnFiToken = await ethers.getContractFactory("LearnFiToken");
  const learnToken = await LearnFiToken.deploy(
    deployer.address, // admin
    deployer.address, // minter (will be backend service address in production)
    deployer.address  // pauser
  );
  await learnToken.waitForDeployment();
  const learnTokenAddress = await learnToken.getAddress();
  console.log("✅ LearnFi Token deployed to:", learnTokenAddress);

  // Deploy Badge NFT
  console.log("\n🏆 Deploying Badge NFT...");
  const BadgeNFT = await ethers.getContractFactory("BadgeNFT");
  const badgeNFT = await BadgeNFT.deploy(
    deployer.address, // admin
    deployer.address  // minter (will be backend service address in production)
  );
  await badgeNFT.waitForDeployment();
  const badgeNFTAddress = await badgeNFT.getAddress();
  console.log("✅ Badge NFT deployed to:", badgeNFTAddress);

  // Mint some initial tokens to deployer (for testing)
  if (network.chainId === 31337n || network.chainId === 84532n) { // localhost or Base Sepolia
    console.log("\n💰 Minting initial tokens for testing...");
    const initialMint = ethers.parseEther("100000"); // 100k tokens
    const tx = await learnToken.mintLearningReward(
      deployer.address,
      initialMint,
      "Initial deployment mint"
    );
    await tx.wait();
    console.log("✅ Minted 100,000 LEARN tokens to deployer");

    // Mint a test badge
    console.log("\n🎖️ Minting test badge...");
    const badgeTx = await badgeNFT.mintBadge(
      deployer.address,
      "ipfs://QmTest123/metadata.json", // Replace with real IPFS URI
      false // not soulbound
    );
    await badgeTx.wait();
    console.log("✅ Minted test badge NFT to deployer");
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId);
  console.log("Deployer:", deployer.address);
  console.log("\nContract Addresses:");
  console.log("  LearnFi Token:", learnTokenAddress);
  console.log("  Badge NFT:", badgeNFTAddress);
  console.log("=".repeat(60));

  // Save addresses to file
  const fs = require("fs");
  const addresses = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    contracts: {
      LearnFiToken: learnTokenAddress,
      BadgeNFT: badgeNFTAddress,
    },
    deployedAt: new Date().toISOString(),
  };

  const fileName = `deployed-addresses-${network.chainId}.json`;
  fs.writeFileSync(fileName, JSON.stringify(addresses, null, 2));
  console.log(`\n💾 Contract addresses saved to ${fileName}`);

  // Verification instructions
  if (network.chainId === 84532n || network.chainId === 8453n) {
    console.log("\n📝 To verify contracts on Basescan:");
    console.log(`npx hardhat verify --network ${network.name} ${learnTokenAddress} "${deployer.address}" "${deployer.address}" "${deployer.address}"`);
    console.log(`npx hardhat verify --network ${network.name} ${badgeNFTAddress} "${deployer.address}" "${deployer.address}"`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
