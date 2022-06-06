# Hardhat Fund Me FCC WSL-UBUNTU Ganache Version

This project is an adaptation from FreeCodeCamp.org "Learn Blockchain, Solidity, and Full Stack Web3 Development with JavaScript – 32-Hour Course" at https://www.youtube.com/watch?v=gyMwXuJrbJQ&t=32797s

Hardhat Node was not working, so I am using Ganache.

# Known Issues and NOTES

1) When withdraw.js is run on localhost, although the funds are withadrawn out of the contract address, the funds do NOT go back into the funding address.

This error does not happen on the Rinkeby Testnet.

2) Script tags are not implemented in package.json (overkill)