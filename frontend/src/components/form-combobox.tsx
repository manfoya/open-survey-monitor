"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { errorDiv } from "@/features/app-shell/components/utils";

export interface ComboboxItem {
  value: string;
  label: string;
  subLabel?: string;
}

interface FormComboboxProps {
  label: string;
  name: string;
  items: ComboboxItem[];
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  error?: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  id?: string;
}

export function FormCombobox({
  label,
  name,
  items,
  value,
  onChange,
  isLoading = false,
  disabled = false,
  error,
  placeholder = "Sélectionner...",
  searchPlaceholder = "Rechercher...",
  emptyLabel = "Aucun résultat trouvé.",
  id,
}: FormComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const elementId = id || name;

  return (
    <div className="space-y-2 flex flex-col">
      <Label htmlFor={elementId}>{label}</Label>
      <input type="hidden" name={name} value={value} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={elementId}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || isLoading}
            className={cn(
              "w-full justify-between font-normal",
              !value && "text-muted-foreground",
              error && error.length > 0 && "border-destructive",
            )}
          >
            {value
              ? items.find((item) => item.value === value)?.label
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyLabel}</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.label} // Command filters by this value by default
                    onSelect={() => {
                      onChange(item.value === value ? "" : item.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{item.label}</span>
                      {item.subLabel && (
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {item.subLabel}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && errorDiv(error)}
    </div>
  );
}
