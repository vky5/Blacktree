export function repoNameFormatter(githubUsername: string, repositoryName: string): string {
  // Format the repository name as "githubUsername/repositoryName"
  return `${githubUsername}/${repositoryName}`;
}