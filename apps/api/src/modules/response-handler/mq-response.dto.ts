import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class MQResponseDTO {
  @IsString()
  DeploymentID: string;

  @IsString()
  ImageURL: string;

  @IsBoolean()
  Success: boolean;

  @IsString()
  Logs: string;

  @IsOptional()
  @IsString()
  Error: string;
}

// type Response struct {
// 	DeploymentID string `json:"deploymentId"` // ID of the deployment/job
// 	ImageURL     string `json:"imageUrl"`     // Full ECR image URL
// 	Success      bool   `json:"success"`      // Job success status
// 	Logs         string `json:"logs"`         // Build logs
// 	Error        string `json:"error"`        // Error message if any
// }
