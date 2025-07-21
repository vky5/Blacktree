import { Clock, Eye, RefreshCw, Trash2 } from "lucide-react";
import clsx from "clsx";
import { StatusDot } from "./statusDot";
import PrivacyLabel from "./privacyLabel";

const deploymentName = "user-auth-service";
const status: "building" | "active" | "failed" = "building";
const timestamp = "5 minutes ago";
const isPrivate = true;

type props = {
  deploymentname: string;
  status: "building" | "active" | "failed";
  timeStamp: string;
  isPrivate: boolean;
};

export default function DeploymentCard() {
  return (
    <div className="bg-[#0B0F19] rounded-xl border border-[#1a1f2e] px-5 py-4 flex flex-col gap-4 w-full max-w-md">
      {/* Title */}
      <span className="text-white font-medium text-lg">{deploymentName}</span>

      {/* Info Row */}
      <div className="flex justify-between items-center">
        {/* Left side: status + privacy */}
        <div className="flex flex-col flex-1">
          <div className="flex items-center mt-1 space-x-2">
            {/* Status */}
            <div className="flex items-center text-xs text-gray-300 space-x-2">
              <StatusDot status={status} />
              <span
                className={clsx({
                  "text-yellow-400": status === "building",
                  "text-[#33CF96]": status === "active",
                  "text-red-400": status === "failed",
                })}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>

            <PrivacyLabel isPrivate={false} />
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1 text-gray-400 text-xs ml-2">
          <Clock size={12} />
          <span>{timestamp}</span>
        </div>
      </div>

      {/* Buttons Row */}
      <div className="flex gap-2 justify-between w-full">
        <button className="flex-1 text-xs px-3 py-1.5 rounded-md bg-[#1a1f2e] text-gray-200 hover:bg-[#2a2f3f] flex items-center justify-center gap-1">
          <Eye size={12} />
          View Logs
        </button>

        <button className="flex-1 text-xs px-3 py-1.5 rounded-md bg-[#1a1f2e] text-gray-200 hover:bg-[#2a2f3f] flex items-center justify-center gap-1">
          <RefreshCw size={12} />
          Redeploy
        </button>

        <button className="flex-1 text-xs px-3 py-1.5 rounded-md bg-[#1a1f2e] text-red-400 hover:bg-[#2a2f3f] hover:text-red-500 flex items-center justify-center gap-1">
          <Trash2 size={12} />
          Delete
        </button>
      </div>
    </div>
  );
}
