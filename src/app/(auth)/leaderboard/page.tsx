import { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";

const USERS: User[] = Array.from({ length: 10 }, (_, i) => ({
  id: `${i + 1}`,
  email: `user${i + 1}@example.com`,
  name: `User ${i + 1}`,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
  points: Math.floor(Math.random() * 1000),
  completedQuests: [],
}));

USERS.sort((a, b) => b.points - a.points).forEach((user, i) => {
  user.rank = i + 1;
});

export default function LeaderboardPage() {
  return (
    <Container
      title="Leaderboard"
      description="Top fans competing for Super Bowl tickets"
    >
      <div className="grid grid-cols-1 gap-4">
        {USERS.map((user) => (
          <Card
            key={user.id}
            className="flex items-center space-x-4 rounded-lg shadow-sm"
          >
            <span className="min-w-[2rem] text-2xl font-bold">{user.rank}</span>
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">
                {user.points} points
              </p>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
