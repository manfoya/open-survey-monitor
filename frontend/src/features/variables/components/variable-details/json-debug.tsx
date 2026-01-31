"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VariableDataType } from "@/features/variables/types";
import { ChevronDown, ChevronRight, Code } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function VariableJsonDebug({
  variable,
}: {
  variable: VariableDataType;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="border-dashed">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <Code className="h-4 w-4" />
            Configuration technique (JSON)
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-8 w-8 p-0"
          >
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="sr-only">{isOpen ? "Masquer" : "Afficher"}</span>
          </Button>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0 pb-4">
          <div className="bg-muted p-4 rounded-md overflow-x-auto border">
            <pre className="text-xs font-mono text-foreground/80">
              {JSON.stringify(variable.ui_config || {}, null, 2)}
            </pre>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
