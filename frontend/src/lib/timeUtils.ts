export function calculateTimeRemaining(createdAt: string, durationHours: number): string {
  const createdDate = new Date(createdAt);
  const endDate = new Date(createdDate.getTime() + durationHours * 60 * 60 * 1000);
  const now = new Date();

  if (now >= endDate) {
    return "Expired";
  }

  const timeLeft = endDate.getTime() - now.getTime();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  if (hoursLeft > 24) {
    const daysLeft = Math.floor(hoursLeft / 24);
    return `${daysLeft} days ${hoursLeft % 24} hours remaining`;
  }

  return `${hoursLeft} hours ${minutesLeft} minutes remaining`;
}

export function isPollExpired(createdAt: string, durationHours: number): boolean {
  const createdDate = new Date(createdAt);
  const endDate = new Date(createdDate.getTime() + durationHours * 60 * 60 * 1000);
  return new Date() >= endDate;
}