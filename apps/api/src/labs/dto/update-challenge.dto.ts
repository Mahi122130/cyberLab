export class UpdateChallengeDto {
  title?: string;
  description?: string;
  task?: string;
  points?: number;
  order_number?: number;
  is_active?: boolean | number;
}