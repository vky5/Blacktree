import GithubConnect from "./Page1/GithubConnect";
import RepositorySelect from "./RepositorySelect";
import { useAuth } from "@/context/AuthContext";

function IntegrationStep1({ onRepoDataChange }: { onRepoDataChange: (valid: boolean) => void }) {
  const { userData } = useAuth();

  const handleRepoChange = (data: { repo: string; branch: string; dockerPath: string }) => {
    const allFilled = Boolean(data.repo && data.branch && data.dockerPath);
    onRepoDataChange(allFilled);
  };

  return (
    <div className="mx-10 my-7 px-6 py-5 bg-[#111] rounded-lg">
      <div className="text-2xl font-semibold border-zinc-800 text-emerald-500">
        Connect Your Repository
      </div>
      <div className="text-gray-200 mt-2">
        Connect your GitHub account and select the repository you want to deploy
      </div>
      <div className="mt-4">
        <GithubConnect />
      </div>

      {userData?.github_connect === true && (
        <div>
          <RepositorySelect onChange={handleRepoChange} />
        </div>
      )}
    </div>
  );
}

export default IntegrationStep1;
