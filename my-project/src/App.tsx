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
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-400 to-purple-600">
      <div className="text-4xl font-extrabold text-white drop-shadow-lg animate-pulse">
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
  userWins,
  userLosses,
  userDraws,
}: {
  gameState: boolean;
  toggleGameState: () => void;
  handleMove: (move: string) => void;
  userSelection: string;
  computerSelection: string;
  result: string;
  userWins: number;
  userLosses: number;
  userDraws: number;
}) => {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-r from-teal-300 to-indigo-600">
      <div className="w-4/5">
        <div className="flex justify-center">
          <button
            onClick={toggleGameState}
            className="bg-green-600 text-white font-bold px-8 py-3 rounded-lg my-4 hover:bg-green-500 transition shadow-lg transform hover:scale-105">
            {gameState ? "Stop Game" : "Start Game"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white shadow-xl rounded-lg p-6 transform hover:scale-105 transition">
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
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-400 transition shadow-md">
                    Ice
                  </button>
                  <button
                    onClick={() => handleMove("Fire")}
                    className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-400 transition shadow-md">
                    Fire
                  </button>
                  <button
                    onClick={() => handleMove("Water")}
                    className="bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-400 transition shadow-md">
                    Water
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="bg-white shadow-xl rounded-lg p-6 transform hover:scale-105 transition">
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
        <div className="mt-6 text-center">
          <div className="bg-green-500 text-white text-2xl font-extrabold py-3 px-6 rounded-lg shadow-lg">
            Game Results: {result || "-"}
          </div>
        </div>
        <div className="mt-6 flex justify-around">
          <div className="text-white font-bold text-lg">
            Wins: <span className="text-green-300">{userWins}</span>
          </div>
          <div className="text-white font-bold text-lg">
            Losses: <span className="text-red-300">{userLosses}</span>
          </div>
          <div className="text-white font-bold text-lg">
            Draws: <span className="text-yellow-300">{userDraws}</span>
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
]  const [result, setResult] = useState("");
  const [userWins, setUserWins] = useState(0);
  const [userLosses, setUserLosses] = useState(0);
  const [userDraws, setUserDraws] = useState(0);

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
    setLoading(true);

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
        setUserWins((prev) => prev + 1);
      } else if (duelResult === "Lose") {
        setResult("You lose");
        setUserLosses((prev) => prev + 1);
      } else {
        setResult("Draw");
        setUserDraws((prev) => prev + 1);
      }
      setComputerSelection(resultData.computer_selection.toString());
    } catch (error) {
      console.log("Error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-gradient-bg">
      <style>
        {`
          @keyframes gradientAnimation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient-bg {
            background-size: 200% 200%;
            animation: gradientAnimation 10s ease infinite;
          }
        `}
      </style>
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
          userWins={userWins}
          userLosses={userLosses}
          userDraws={userDraws}
        />
      ) : (
        GameWrapper1()
      )}
    </div>
  );
  
}

export default App;
