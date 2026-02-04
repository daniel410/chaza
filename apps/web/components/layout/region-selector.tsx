'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/lib/store';
import { Region } from '@chaza/shared';

const regions = [
  { value: 'US', label: 'United States', flag: '🇺🇸', currency: 'USD' },
  { value: 'CA', label: 'Canada', flag: '🇨🇦', currency: 'CAD' },
] as const;

export function RegionSelector() {
  const { region, setRegion } = useAuthStore();

  const currentRegion = regions.find((r) => r.value === region) || regions[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <span className="text-base">{currentRegion.flag}</span>
          <span className="hidden sm:inline">{currentRegion.value}</span>
          <Globe className="h-4 w-4 sm:hidden" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {regions.map((r) => (
          <DropdownMenuItem
            key={r.value}
            onClick={() => setRegion(r.value as Region)}
            className="gap-2"
          >
            <span>{r.flag}</span>
            <span>{r.label}</span>
            <span className="ml-auto text-muted-foreground text-xs">
              {r.currency}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
