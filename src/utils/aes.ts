import { ethers } from "ethers";

export async function deriveAESKey(signer: ethers.Signer) {
  const address = await signer.getAddress();
  const message = `Encryption key for ${address}`;

  // Sign a fixed message with MetaMask
  const signedMessage = await signer.signMessage(message);

  // Hash the signed message to produce a key derivation material
  const hash = ethers.toBeArray(ethers.keccak256(signedMessage));

  // Import the derived hash as a CryptoKey for AES-GCM encryption
  const key = await crypto.subtle.importKey(
    "raw", // Import as a raw key
    hash, // Use the hashed signed message as key material
    { name: "AES-GCM", length: 256 }, // AES-GCM with 256-bit length
    false, // Not extractable
    ["encrypt", "decrypt"] // Key usages
  );
  return key;
}

// Encrypt the message using AES-GCM
export async function encryptMessage(message?: string, aesKey?: CryptoKey) {
  if (!aesKey || !message) {
    return "";
  }
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Generate a random 12-byte IV for AES-GCM
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(message);

  // Encrypt the message
  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    aesKey,
    messageBytes
  );
  return {
    iv: ethers.hexlify(iv),
    encryptedMessage: ethers.hexlify(new Uint8Array(encryptedContent)),
  };
}

export async function decryptMessage(encryptedData: any, aesKey: CryptoKey) {
  const iv = ethers.toBeArray(encryptedData.iv);
  const encryptedContent = ethers.toBeArray(encryptedData.encryptedMessage);

  // Decrypt the message
  const decryptedContent = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    aesKey,
    encryptedContent
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedContent);
}
