export function generateRandomDraw(count: number = 5, min: number = 1, max: number = 45): number[] {
  const numbers = new Set<number>();
  while(numbers.size < count) {
    numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

export function generateAlgorithmicDraw(userScores: number[]): number[] {
  // Logic to weight numbers based on frequently entered scores
  // Returning a placeholder array for the assignment scope
  return [7, 14, 21, 28, 35]; 
}