"use client";

import Poll from "@/app/(app)/games/_components/poll";
import { TeamCard } from "@/app/(app)/games/_components/team-card";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUserInfo } from "@/lib/auth";
import {
  useCreatePrediction,
  useGame,
  useCurrentUserGamePrediction,
} from "@/lib/hooks/use-games";
import { type GameResponse } from "@renegade-fanclub/types";
import { motion } from "framer-motion";
import { MagicUserMetadata } from "magic-sdk";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import debounce from 'lodash/debounce';

interface GameProps {
  gameId: number;
  initialGame: GameResponse;
}

export function Game({ gameId, initialGame }: GameProps) {
  const { data: game, isLoading: gameLoading } = useGame(gameId);
  const { data: userPrediction } = useCurrentUserGamePrediction(gameId);
  const currentGame = game || initialGame;
  const [localPrediction, setLocalPrediction] = useState<number | null>(
    userPrediction?.predictedWinnerId || null
  );
  const { toast } = useToast();
  const { mutate: createPrediction, isPending: submitting } =
    useCreatePrediction();
  const [currentUser, setCurrentUser] = useState<MagicUserMetadata | null>(
    null,
  );

  const debouncedCreatePrediction = useRef(
    debounce((teamId: number) => {
      createPrediction(
        {
          gameId,
          predictedWinnerId: teamId,
        },
        {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Prediction updated successfully!",
            });
          },
          onError: (error) => {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            toast({
              variant: "destructive",
              title: "Error",
              description: errorMessage.includes("UNAUTHORIZED")
                ? "Please sign in to make predictions"
                : "Failed to update prediction. Please try again.",
            });
            console.error("Failed to update prediction:", error);
          },
        },
      );
    }, 5000)
  ).current;

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const userInfo = await getCurrentUserInfo();
      setCurrentUser(userInfo);
    };
    fetchCurrentUser();
  }, []);

  const currentPrediction = useMemo(() => 
    localPrediction ? { predictedWinnerId: localPrediction } : null
  , [localPrediction]);

  const handleVote = useCallback(
    (teamId: number, teamTitle: string) => {
      if (currentGame.status === "completed") {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Cannot make predictions for completed games",
        });
        return;
      }

      const gameStartTime = new Date(currentGame.startTime);
      const currentTime = new Date();

      if (currentTime > gameStartTime) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Cannot change predictions after the game has started",
        });
        return;
      }

      if (!currentUser || !currentUser.issuer) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please sign in to make predictions",
        });
        return;
      }

      // Update local state immediately for quick UI feedback
      setLocalPrediction(teamId);

      // Use debounced prediction update
      debouncedCreatePrediction(teamId);

      // If not already submitting, submit immediately
      if (!submitting) {
        debouncedCreatePrediction.cancel(); // Cancel any pending debounced updates
        createPrediction(
          {
            gameId,
            predictedWinnerId: teamId,
          },
          {
            onSuccess: () => {
              toast({
                title: "Success",
                description: "Prediction submitted successfully!",
              });
            },
            onError: (error) => {
              // Revert local state on error
              setLocalPrediction(null);
              const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
              toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage.includes("UNAUTHORIZED")
                  ? "Please sign in to make predictions"
                  : "Failed to submit prediction. Please try again.",
              });
              console.error("Failed to submit prediction:", error);
            },
          },
        );
      } else {
        console.log("Submission in progress, updating local state only");
      }
    },
    [
      gameId,
      currentGame,
      submitting,
      createPrediction,
      debouncedCreatePrediction,
      toast,
      currentUser,
    ],
  );

  if ((gameLoading) && !initialGame) {
    return (
      <div className="py-8">
        <div className="animate-pulse">
          <Card className="p-6 mb-8">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </Card>
          <div className="h-32 bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        {typeof currentGame.apiMetadata === "object" &&
          currentGame.apiMetadata !== null &&
          "conference" in currentGame.apiMetadata && (
            <div className="text-center my-4">
              <h2 className="text-2xl font-bold">
                {currentGame.apiMetadata.conference as string} Championship
              </h2>
              <p className="text-base font-medium text-white mt-2">
                {new Date(currentGame.startTime).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}

        {currentGame.status === "completed" && (
          <div className="text-center my-8">
            <div className="bg-gray-100 rounded-full px-6 py-3 inline-block">
              <span className="font-semibold text-lg">
                Winner:{" "}
                {currentGame.winnerTeamId === currentGame.homeTeamId
                  ? currentGame.homeTeamName
                  : currentGame.awayTeamName}
              </span>
            </div>
          </div>
        )}
      </div>
      <h3 className="text-2xl py-4 font-bold text-center">Who Will Win?</h3>
      <div className="flex justify-center gap-8 mb-8">
        <motion.div
          animate={{
            scale:
              currentPrediction?.predictedWinnerId === currentGame.homeTeamId
                ? 1.05
                : 1,
            boxShadow:
              currentPrediction?.predictedWinnerId === currentGame.homeTeamId
                ? "0px 0px 8px 2px rgba(0, 255, 0, 0.5)"
                : "none",
          }}
          transition={{ duration: 0.3 }}
        >
          <TeamCard
            teamName={currentGame.homeTeamName}
            teamMetadata={currentGame.homeTeamMetadata}
            isHome={true}
            selected={
              currentPrediction?.predictedWinnerId === currentGame.homeTeamId
            }
            onClick={() =>
              handleVote(currentGame.homeTeamId, currentGame.homeTeamName)
            }
          />
        </motion.div>
        <motion.div
          animate={{
            scale:
              currentPrediction?.predictedWinnerId === currentGame.awayTeamId
                ? 1.05
                : 1,
            boxShadow:
              currentPrediction?.predictedWinnerId === currentGame.awayTeamId
                ? "0px 0px 8px 2px rgba(0, 255, 0, 0.5)"
                : "none",
          }}
          transition={{ duration: 0.3 }}
        >
          <TeamCard
            teamName={currentGame.awayTeamName}
            teamMetadata={currentGame.awayTeamMetadata}
            isHome={false}
            selected={
              currentPrediction?.predictedWinnerId === currentGame.awayTeamId
            }
            onClick={() =>
              handleVote(currentGame.awayTeamId, currentGame.awayTeamName)
            }
          />
        </motion.div>
      </div>
      {currentPrediction !== null && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-8"
        >
          {new Date() < new Date(currentGame.startTime) && (
            <p className="text-sm text-gray-400 mt-2">
              You can change your prediction until the game starts.
            </p>
          )}
        </motion.div>
      )}
      <div className="pt-8">
        <Poll game={currentGame} selectedTeamId={localPrediction} />
      </div>
    </>
  );
}
