const feedAbi = [
    "function decimals() view returns (uint8)",
    "function latestAnswer() view returns (int256)",
    "function latestTimestamp() view returns (uint256)",
    "function latestRound() view returns (uint256)",
    "function getAnswer(uint256 roundId) view returns (int256)",
    "function getTimestamp(uint256 roundId) view returns (uint256)",
    "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",    
    "function owner() view returns (address)",
    "function getRoundData(uint80 _roundId) view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
]
export default feedAbi