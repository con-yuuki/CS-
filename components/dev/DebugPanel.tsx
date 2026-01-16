"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Bug, Database, Zap } from "lucide-react";

interface DebugPanelProps {
  data?: any;
  title?: string;
}

export function DebugPanel({ data, title = "デバッグ情報" }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // 開発環境でのみ表示
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      {isOpen && (
        <Card className="shadow-lg border-2 border-blue-500">
          <CardHeader className="bg-blue-50 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bug className="h-4 w-4" />
                {title}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-6 w-6 p-0"
                >
                  {isMinimized ? "□" : "_"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          {!isMinimized && (
            <CardContent className="p-3 max-h-96 overflow-auto">
              <pre className="text-xs bg-gray-50 p-2 rounded border overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </CardContent>
          )}
        </Card>
      )}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg"
          size="sm"
        >
          <Bug className="h-4 w-4 mr-2" />
          デバッグ
        </Button>
      )}
    </div>
  );
}




