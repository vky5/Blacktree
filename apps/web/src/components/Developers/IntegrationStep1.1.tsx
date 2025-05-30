
import GithubConnect from "./Page1/GithubConnect";

function IntegrationStep1() {

  return (
    <div className="mx-10 my-7 px-6 py-5 bg-[#111] rounded-lg">
      {/* heading */}
      <div>
        <div className="text-2xl font-semibold border-zinc-800 text-emerald-800">
          Connect Your Repository
        </div>
        <div className="text-gray-200 mt-2">
          Connect your GitHub account and select the repository you want to deploy
        </div>
        <div className="mt-4">
          <GithubConnect />
        </div>
      </div>
    </div>
  );
}

export default IntegrationStep1;
