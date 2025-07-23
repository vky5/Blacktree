"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreVertical, RefreshCw, Eye, Trash2, Copy, CheckCircle } from "lucide-react";

interface APIKey {
  id: string;
  name: string;
  apiKey: string;
  status: "active" | "inactive";
  created: string;
  lastUsed: string;
  requests: number;
}

interface APIKeyCardProps {
  apiKey: APIKey;
  copiedKey: string;
  copyApiKey: (key: string) => void;
}

const APIKeyCard: React.FC<APIKeyCardProps> = ({ apiKey, copiedKey, copyApiKey }) => {
  return (
    <Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-colors">
      <CardContent className="px-4 py-1">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="text-md font-semibold text-white mb-1">{apiKey.name}</h4>
            <div className="flex items-center gap-2">
              <Badge
                className={`${
                  apiKey.status === "active"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                }`}
              >
                {apiKey.status}
              </Badge>
              <span className="text-sm text-gray-400">Created {apiKey.created}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
              <DropdownMenuItem className="hover:bg-gray-800">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-800">
                <Eye className="w-4 h-4 mr-2" />
                View Usage
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-800 text-red-400">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
            <Input
              value={apiKey.apiKey}
              readOnly
              className="bg-transparent border-none text-white font-mono text-sm flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyApiKey(apiKey.apiKey)}
              className="h-8 w-8 text-gray-400 hover:text-white"
            >
              {copiedKey === apiKey.apiKey ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Last Used:</span>
              <div className="text-white font-medium">{apiKey.lastUsed}</div>
            </div>
            <div>
              <span className="text-gray-400">Total Requests:</span>
              <div className="text-white font-medium">{apiKey.requests}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default APIKeyCard;
