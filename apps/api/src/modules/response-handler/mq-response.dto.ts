import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class MQResponseDTO {
  @IsString()
  deploymentId: string; // lowercase to match incoming message

  @IsOptional()
  @IsString()
  imageUrl?: string; // optional, lowercase

  @IsBoolean()
  success: boolean; // lowercase

  @IsOptional()
  @IsString()
  logs?: string; // optional, lowercase

  @IsOptional()
  @IsString()
  error?: string; // optional, lowercase
}

// type Response struct {
// 	DeploymentID string `json:"deploymentId"` // ID of the deployment/job
// 	ImageURL     string `json:"imageUrl"`     // Full ECR image URL
// 	Success      bool   `json:"success"`      // Job success status
// 	Logs         string `json:"logs"`         // Build logs
// 	Error        string `json:"error"`        // Error message if any
// }
