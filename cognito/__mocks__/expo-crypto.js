// __mocks__/expo-crypto.js

module.exports = {
  // This is what your code calls:
  digestStringAsync: jest.fn(async (algo, value, opts) => {
    // you can return a dummy base64 string:
    return "ZmFrZV9oYXNo";  
  }),
  CryptoDigestAlgorithm: {
    SHA256: "SHA256",
  },
  CryptoEncoding: {
    BASE64: "BASE64",
  },
};
