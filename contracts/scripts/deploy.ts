import { ethers, run } from "hardhat";
import { parseEther } from "ethers";

async function main() {
  console.log("Preparing to deploy the ReligiousWarplet contract...");

  const ReligiousWarpletFactory = await ethers.getContractFactory("ReligiousWarplet");

  // --- Contract Constructor Arguments ---
  const initialMintFee = parseEther("0.0003");
  const constructorArgs = [initialMintFee];

  console.log("Deploying contract with constructor arguments:", {
    initialMintFee: initialMintFee.toString(),
  });

  const religiousWarplet = await ReligiousWarpletFactory.deploy(initialMintFee);

  await religiousWarplet.waitForDeployment();

  console.log(`ReligiousWarplet contract deployed to address: ${await religiousWarplet.getAddress()}`);

  console.log("\nWaiting for 5 block confirmations before verification...");
  const deployTx = religiousWarplet.deploymentTransaction();
  if (deployTx) {
    await deployTx.wait(5);
  }
  console.log("5 block confirmations received.");

  console.log("\nVerifying contract on the blockchain explorer...");
  try {
    await run("verify:verify", {
      address: await religiousWarplet.getAddress(),
      constructorArguments: constructorArgs,
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.error("Verification failed.", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
