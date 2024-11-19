import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const moduleAddress =
  "0x496fa09cb3f485f75ba07edbb668b619a994bbc3033d5e5799b43790457e10eb";
const moduleName = "IceFireWater";

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const client = new Aptos(aptosConfig);

const GameWrapper1 = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="text-4xl font-semibold text-gray-800">
        Please connect your wallet to continue
      </div>
    </div>
  );
};

const GameWrapper2 = ({
  gameState,
  toggleGameState,
  handleMove,
  userSelection,
  computerSelection,
  result,
  userStats,
}: {
  gameState: boolean;
  toggleGameState: () => void;
  handleMove: (move: string) => void;
  userSelection: string;
  result: string;
  computerSelection: string;
  userStats: { win: number; lose: number; draw: number };
}) => {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-600 via-purple-700 to-pink-500 animate-gradient">
      <div className="w-4/5">
        <div className="flex justify-center">
          <button
            onClick={toggleGameState}
            className="bg-green-600 text-white font-semibold px-8 py-3 rounded-lg my-4 hover:bg-green-500 transition">
            {gameState ? "Stop Game" : "Start Game"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* User Move */}
          <div className="bg-white shadow-lg rounded-lg p-5">
            <div className="text-xl font-semibold text-center text-gray-800 mb-4">
              Select Your Move
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {userSelection ? (
                <>
                  <button
                    onClick={() => handleMove("Clear")}
                    className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-400 transition">
                    Clear
                  </button>
                  <button className="bg-purple-600 text-white px-6 py-3 rounded-lg cursor-default">
                    {userSelection}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleMove("Ice")}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-400 transition">
                    Ice
                  </button>
                  <button
                    onClick={() => handleMove("Fire")}
                    className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-400 transition">
                    Fire
                  </button>
                  <button
                    onClick={() => handleMove("Water")}
                    className="bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-400 transition">
                    Water
                  </button>
                </>
              )}
            </div>
          </div>
          {/* Computer Move */}
          <div className="bg-white shadow-lg rounded-lg p-5">
            <div className="text-xl font-semibold text-center text-gray-800 mb-4">
              Computer Move
            </div>
            <div className="flex justify-center">
              {computerSelection ? (
                <button className="bg-purple-600 text-white px-6 py-3 rounded-lg cursor-default">
                  {computerSelection}
                </button>
              ) : (
                <div className="text-gray-500 text-lg font-semibold">
                  Take your turn first.
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Game Result */}
        <div className="mt-6">
          <div className="bg-green-500 text-white text-2xl font-semibold py-3 px-6 rounded-lg text-center">
            Game Results: {result || "-"}
          </div>
        </div>
        {/* User Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-blue-500 text-white text-lg font-semibold py-3 px-6 rounded-lg text-center">
            Wins: {userStats.win}
          </div>
          <div className="bg-red-500 text-white text-lg font-semibold py-3 px-6 rounded-lg text-center">
            Losses: {userStats.lose}
          </div>
          <div className="bg-yellow-500 text-white text-lg font-semibold py-3 px-6 rounded-lg text-center">
            Draws: {userStats.draw}
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { account, connected, signAndSubmitTransaction } = useWallet();

  const [gameState, setGameState] = useState(false);
  const [userSelection, setUserSelection] = useState("");
  const [computerSelection, setComputerSelection] = useState("");
  const [result, setResult] = useState("");
  const [userStats, setUserStats] = useState({ win: 0, lose: 0, draw: 0 });

  async function toggleGameState() {
    setGameState(!gameState);

    const payload: InputTransactionData = {
      data: {
        function: `${moduleAddress}::${moduleName}::createGame`,
        functionArguments: [],
      },
    };

    await handeTranstion(payload);
    setUserSelection("");
    setComputerSelection("");
    setResult("");
  }

  async function handleMove(move: string) {
    if (move === "Clear") {
      setUserSelection("");
      setComputerSelection("");
      setResult("");
    } else {
      const payload: InputTransactionData = {
        data: {
          function: `${moduleAddress}::${moduleName}::duel`,
          functionArguments: [move],
        },
      };
      await handeTranstion(payload);
      setUserSelection(move);
    }
  }

  const handeTranstion = async (payload: InputTransactionData) => {
    if (!account) return;

    try {
      const tx = await signAndSubmitTransaction(payload);
      console.log(tx);

      const resultData = await client.getAccountResource({
        accountAddress: account?.address,
        resourceType: `${moduleAddress}::${moduleName}::DuelResult`,
      });

      console.log(resultData);

      const duelResult = resultData.duel_result.toString();

      if (duelResult === "Win") {
        setResult("You win");
        setUserStats((prev) => ({ ...prev, win: prev.win + 1 }));
      } else if (duelResult === "Lose") {
        setResult("You lose");
        setUserStats((prev) => ({ ...prev, lose: prev.lose + 1 }));
      } else {
        setResult("Draw");
        setUserStats((prev) => ({ ...prev, draw: prev.draw + 1 }));
      }
      setComputerSelection(resultData.computer_selection.toString());
    } catch (error) {
      console.log("Error", error);
    }
  };

  return (
    <>
      <div className="w-full h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-600 via-purple-700 to-pink-500 animate-gradient">
        <div className="absolute right-4 top-4">
          <WalletSelector />
        </div>
        {connected ? (
          <GameWrapper2
            computerSelection={computerSelection}
            result={result}
            handleMove={handleMove}
            userSelection={userSelection}
            gameState={gameState}
            toggleGameState={toggleGameState}
            userStats={userStats}
          />
        ) : (
          GameWrapper1()
        )}
      </div>
    </>
  );
}

export default App;
